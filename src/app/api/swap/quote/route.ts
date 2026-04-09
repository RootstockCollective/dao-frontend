import { NextRequest, NextResponse } from 'next/server'
import { Address, getAddress, isAddress } from 'viem'

import { logger } from '@/lib/logger'
import { SWAP_TOKEN_ADDRESSES, UNISWAP_FEE_TIERS } from '@/lib/swap/constants'
import { uniswapProvider } from '@/lib/swap/providers/uniswap'
import { getTokenDecimalsBatch, isValidAmount, scaleAmount } from '@/lib/swap/utils'

/**
 * Cache quotes for 30 seconds
 * Quotes are time-sensitive, so we use a short cache duration
 */
export const revalidate = 30

function parseOptionalFeeTier(raw: string | null): number | undefined {
  if (raw === null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isInteger(n) || !(UNISWAP_FEE_TIERS as readonly number[]).includes(n)) {
    return undefined
  }
  return n
}

/**
 * GET /api/swap/quote
 *
 * Uses the same `uniswapProvider.getQuote` path as the in-app swap flow (including multihop
 * pairs resolved in `src/lib/swap/routes.ts`, e.g. USDRIF↔RIF via USDT0).
 *
 * Query parameters:
 * - tokenIn: Token address to swap from (defaults to USDT0)
 * - tokenOut: Token address to swap to (defaults to USDRIF)
 * - amount: Amount to swap (human-readable string, e.g., "100.5")
 * - feeTier: Optional Uniswap V3 fee tier (100, 500, 3000, 10000). Omit for Auto (best quote).
 *
 * Example:
 * GET /api/swap/quote?tokenIn=...&tokenOut=...&amount=100&feeTier=500
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tokenInParam = searchParams.get('tokenIn')
  const tokenOutParam = searchParams.get('tokenOut')
  const amountParam = searchParams.get('amount')
  const feeTier = parseOptionalFeeTier(searchParams.get('feeTier'))

  try {
    const tokenIn = (
      tokenInParam && isAddress(tokenInParam) ? tokenInParam : SWAP_TOKEN_ADDRESSES.USDT0
    ) as Address
    const tokenOut = (
      tokenOutParam && isAddress(tokenOutParam) ? tokenOutParam : SWAP_TOKEN_ADDRESSES.USDRIF
    ) as Address

    // Validate amount
    if (!amountParam || !isValidAmount(amountParam)) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number.' },
        { status: 400 },
      )
    }

    // Read decimals for both tokens in parallel
    // getTokenDecimalsBatch returns map with normalized (checksummed) addresses as keys
    const decimalsMap = await getTokenDecimalsBatch([tokenIn, tokenOut])
    const tokenInDecimals = decimalsMap[getAddress(tokenIn)]
    const tokenOutDecimals = decimalsMap[getAddress(tokenOut)]

    if (typeof tokenInDecimals !== 'number' || typeof tokenOutDecimals !== 'number') {
      return NextResponse.json({ error: 'Failed to read token decimals' }, { status: 500 })
    }

    // Scale the input amount to contract format
    const amountIn = scaleAmount(amountParam, tokenInDecimals)

    // Initialize providers (for now, just Uniswap)
    const providers = [uniswapProvider]

    // Get quotes from all providers in parallel
    const quotePromises = providers.map(provider =>
      provider
        .getQuote({
          tokenIn,
          tokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          ...(feeTier !== undefined ? { feeTier } : {}),
        })
        .catch(error => ({
          provider: provider.name,
          amountOut: '0',
          amountOutRaw: '0',
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
    )

    const quotes = await Promise.all(quotePromises)

    return NextResponse.json({ quotes }, { status: 200 })
  } catch (error) {
    logger.error({ err: error, route: '/api/swap/quote' }, 'Error fetching swap quotes')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch swap quotes' },
      { status: 500 },
    )
  }
}
