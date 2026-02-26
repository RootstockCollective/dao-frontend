import { NextRequest, NextResponse } from 'next/server'
import { Address, isAddress, getAddress } from 'viem'
import { uniswapProvider } from '@/lib/swap/providers/uniswap'
import { SWAP_TOKEN_ADDRESSES } from '@/lib/swap/constants'
import { getTokenDecimalsBatch, scaleAmount, isValidAmount } from '@/lib/swap/utils'
import { cacheLife } from 'next/cache'

async function getCachedSwapQuote(tokenIn: Address, tokenOut: Address, amountParam: string) {
  'use cache'
  cacheLife({ revalidate: 30 })

  const decimalsMap = await getTokenDecimalsBatch([tokenIn, tokenOut])
  const tokenInDecimals = decimalsMap[getAddress(tokenIn)]
  const tokenOutDecimals = decimalsMap[getAddress(tokenOut)]

  if (typeof tokenInDecimals !== 'number' || typeof tokenOutDecimals !== 'number') {
    return { error: 'Failed to read token decimals' as const }
  }

  const amountIn = scaleAmount(amountParam, tokenInDecimals)
  const providers = [uniswapProvider]

  const quotePromises = providers.map(provider =>
    provider.getQuote({ tokenIn, tokenOut, amountIn, tokenInDecimals, tokenOutDecimals }).catch(error => ({
      provider: provider.name,
      amountOut: '0',
      amountOutRaw: '0',
      error: error instanceof Error ? error.message : 'Unknown error',
    })),
  )

  const quotes = await Promise.all(quotePromises)
  return { quotes }
}

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
  const searchParams = request.nextUrl.searchParams
  const tokenInParam = searchParams.get('tokenIn')
  const tokenOutParam = searchParams.get('tokenOut')
  const amountParam = searchParams.get('amount')

  try {
    const tokenIn = (
      tokenInParam && isAddress(tokenInParam) ? tokenInParam : SWAP_TOKEN_ADDRESSES.USDT0
    ) as Address
    const tokenOut = (
      tokenOutParam && isAddress(tokenOutParam) ? tokenOutParam : SWAP_TOKEN_ADDRESSES.USDRIF
    ) as Address

    if (!amountParam || !isValidAmount(amountParam)) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number.' },
        { status: 400 },
      )
    }

    const result = await getCachedSwapQuote(tokenIn, tokenOut, amountParam)

    if ('error' in result && typeof result.error === 'string' && !('quotes' in result)) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ quotes: result.quotes }, { status: 200 })
  } catch (error) {
    console.error('Error fetching swap quotes:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch swap quotes' },
      { status: 500 },
    )
  }
}
