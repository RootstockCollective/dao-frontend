import { Address } from 'viem'
import { SwapProviderName } from '../constants'

/**
 * Quote result from a swap provider
 */
export interface SwapQuote {
  provider: SwapProviderName
  amountOut: string // Human-readable output amount
  amountOutRaw: string // Raw bigint as string
  priceImpact?: string // Percentage if available (e.g., "0.5" for 0.5%)
  gasEstimate?: string // Gas estimate if available
  error?: string // Error message if quote failed
}

/**
 * Parameters for getting a swap quote
 */
export interface QuoteParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint // Amount in contract format (scaled with decimals)
  tokenInDecimals: number
  tokenOutDecimals: number
  feeTier?: number // Optional: specific Uniswap V3 fee tier (100, 500, 3000, 10000). If not provided, tries all tiers and returns best quote
}

/**
 * Base interface for swap providers
 * All providers must implement this interface
 */
export interface SwapProvider {
  /**
   * Name of the provider
   */
  readonly name: SwapProviderName

  /**
   * Get a quote for swapping tokens
   * @param params - Quote parameters
   * @returns Promise resolving to a swap quote
   */
  getQuote(params: QuoteParams): Promise<SwapQuote>
}
