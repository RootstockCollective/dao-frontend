import { NextRequest, NextResponse } from 'next/server'
import { Address, isAddress } from 'viem'
import { uniswapProvider } from '@/lib/swap/providers/uniswap'
import { SWAP_TOKEN_ADDRESSES } from '@/lib/swap/constants'
import { getTokenDecimalsBatch, scaleAmount, isValidAmount } from '@/lib/swap/utils'

/**
 * Cache quotes for 30 seconds
 * Quotes are time-sensitive, so we use a short cache duration
 */
export const revalidate = 30

/**
 * GET /api/swap/quote
 *
 * Query parameters:
 * - tokenIn: Token address to swap from (defaults to USDT0)
 * - tokenOut: Token address to swap to (defaults to USDRIF)
 * - amount: Amount to swap (human-readable string, e.g., "100.5")
 *
 * Example:
 * GET /api/swap/quote?tokenIn=0x779dED0C9e1022225F8e0630b35A9B54Be713736&tokenOut=0x3A15461d8AE0f0Fb5fA2629e9dA7D66A794a6E37&amount=100
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tokenInParam = searchParams.get('tokenIn')
    const tokenOutParam = searchParams.get('tokenOut')
    const amountParam = searchParams.get('amount')

    // For this iteration, tokenIn is always USDT0 and tokenOut is always USDRIF
    // But we validate the params if provided
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
    const decimalsMap = await getTokenDecimalsBatch([tokenIn, tokenOut])
    const tokenInDecimals = decimalsMap[tokenIn]
    const tokenOutDecimals = decimalsMap[tokenOut]

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
    console.error('Error fetching swap quotes:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch swap quotes' },
      { status: 500 },
    )
  }
}
