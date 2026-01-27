import { Address, Hex } from 'viem'
import { PermitSingle } from '@/lib/swap/permit2'
import { USDRIF, USDT0 } from '@/lib/constants'

/**
 * Supported swap tokens
 */
export type SwapTokenSymbol = typeof USDT0 | typeof USDRIF

/**
 * Determines which input field the user is editing and the quote direction.
 * - exactIn: User specifies input amount, quote returns expected output
 * - exactOut: User specifies desired output, quote returns required input
 */
export type SwapMode = 'exactIn' | 'exactOut'

/**
 * Quote result from Uniswap QuoterV2 contract.
 * Contains the amounts and metadata needed to execute a swap.
 */
export interface QuoteResult {
  amountOut: bigint
  gasEstimate: bigint
  feeTier: number
  timestamp: number
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

  // Pool configuration
  poolAddress: Address | null
  poolFee: number | null
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

  // Reset entire store
  reset: () => void
}

/**
 * Complete store type combining state and actions
 */
export type SwapStore = SwapState & SwapActions
