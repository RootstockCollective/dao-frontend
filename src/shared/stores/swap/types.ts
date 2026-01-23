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

  // ERC-20 approval state
  isApproving: boolean
  approvalTxHash: string | null

  // Permit2 signing state
  permit: PermitSingle | null
  permitSignature: Hex | null
  isSigning: boolean

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

  // Approval lifecycle
  startApproval: () => void
  completeApproval: (txHash: string) => void
  clearApproval: () => void

  // Permit signing
  startSigning: () => void
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
