import { Address, Hex } from 'viem'

import { RIF, USDRIF, USDT0, WRBTC } from '@/lib/constants'
import { PermitSingle } from '@/lib/swap/permit2'
import type { SwapQuoteMode } from '@/lib/swap/types'

/**
 * Supported swap tokens
 */
export type SwapTokenSymbol = typeof USDT0 | typeof USDRIF | typeof RIF | typeof WRBTC

/**
 * Determines which input field the user is editing and the quote direction.
 * - exactIn: User specifies input amount, quote returns expected output
 * - exactOut: User specifies desired output, quote returns required input
 */
export type SwapMode = SwapQuoteMode

/**
 * Quote result from Uniswap QuoterV2 contract.
 * Contains the amounts and metadata needed to execute a swap.
 */
export interface QuoteResult {
  amountOut: bigint
  gasEstimate: bigint
  /** Single-hop fee, or first-hop fee when `hopFees` exists. */
  feeTier: number
  timestamp: number
  /** Ordered per-hop fee list used to build the multihop execution path. */
  hopFees?: readonly number[]
  amountIn?: bigint
  sqrtPriceX96After?: bigint
  initializedTicksCrossed?: bigint
}

/**
 * Core swap state managed by Zustand.
 *
 * Note: Quote data and allowance data are managed by React Query hooks,
 * not stored here. This store only manages UI/flow state.
 */
export interface SwapState {
  // Token selection
  tokenIn: SwapTokenSymbol
  tokenOut: SwapTokenSymbol

  // User input
  mode: SwapMode
  typedAmount: string

  // Swap transaction state
  isSwapping: boolean
  swapError: Error | null
  swapTxHash: string | null

  // ERC-20 approval state (isApproving comes from wagmi's isPending)
  approvalTxHash: string | null

  // Permit2 signing state (isSigning comes from wagmi's isPending)
  permit: PermitSingle | null
  permitSignature: Hex | null

  // Pool configuration (single-hop oriented)
  /** Primary pool for single-hop pairs (e.g. USDT0/USDRIF). Unused for multihop quotes; may stay set from a prior pair. */
  poolAddress: Address | null
  /** First-hop fee from the latest quote (single-hop or multihop; execution uses full `hopFees` when present). */
  poolFee: number | null
  /** User fee override. null = Auto (multihop: best per-hop tier combo; explicit: same tier every hop). */
  selectedFeeTier: number | null
}

/**
 * Actions for updating swap state.
 * Grouped by concern for clarity.
 */
export interface SwapActions {
  // Token selection
  setTokenIn: (token: SwapTokenSymbol) => void
  setTokenOut: (token: SwapTokenSymbol) => void
  toggleTokens: () => void

  // User input
  setSwapInput: (mode: SwapMode, typedAmount: string) => void

  // Swap transaction lifecycle
  startSwap: () => void
  completeSwap: (txHash: string) => void
  failSwap: (error: Error) => void
  clearSwapError: () => void

  // Approval lifecycle (loading state from wagmi's isPending)
  setApprovalTxHash: (txHash: string | null) => void

  // Permit signing (loading state from wagmi's isPending)
  setPermitData: (permit: PermitSingle, signature: Hex) => void
  clearPermitData: () => void

  // Pool configuration
  setPoolFee: (fee: number) => void
  setPoolAddress: (address: Address) => void
  setSelectedFeeTier: (feeTier: number | null) => void

  // Reset entire store
  reset: () => void
}

/**
 * Complete store type combining state and actions
 */
export type SwapStore = SwapState & SwapActions
