import { useQuery } from '@tanstack/react-query'
import { Address, isAddress } from 'viem'
import { SWAP_TOKEN_ADDRESSES } from '@/lib/swap/constants'

/**
 * Response type from the swap quote API
 */
export interface SwapQuoteResponse {
  quotes: Array<{
    provider: string
    amountOut: string
    amountOutRaw: string
    priceImpact?: string
    gasEstimate?: string
    error?: string
  }>
}

/**
 * Parameters for fetching swap quotes
 */
export interface UseSwapQuoteParams {
  amount: string
  tokenIn?: Address
  tokenOut?: Address
  enabled?: boolean
}

/**
 * Hook to fetch swap quotes from the API
 *
 * @param params - Quote parameters
 * @returns Query result with quotes from all providers
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSwapQuote({
 *   amount: '100',
 *   tokenIn: USDT0_ADDRESS,
 *   tokenOut: USDRIF_ADDRESS,
 * })
 * ```
 */
export function useSwapQuote(params: UseSwapQuoteParams) {
  const { tokenIn, tokenOut, amount, enabled = true } = params

  // Use default addresses if not provided
  const tokenInAddress = tokenIn || SWAP_TOKEN_ADDRESSES.USDT0
  const tokenOutAddress = tokenOut || SWAP_TOKEN_ADDRESSES.USDRIF

  return useQuery<SwapQuoteResponse>({
    queryKey: ['swapQuote', tokenInAddress, tokenOutAddress, amount],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amount,
      })

      const response = await fetch(`/api/swap/quote?${searchParams.toString()}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch swap quotes' }))
        throw new Error(error.error || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    enabled: enabled && !!amount && isAddress(tokenInAddress) && isAddress(tokenOutAddress),
    staleTime: 30_000, // 30 seconds - matches API cache
    refetchInterval: 60_000, // Refetch every minute for fresh quotes
  })
}
