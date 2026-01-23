import { USDRIF, USDT0 } from '@/lib/constants'
import { Address, Hex } from 'viem'
import { PermitSingle } from '@/lib/swap/permit2'

/**
 * Supported swap tokens
 */
export type SwapTokenSymbol = typeof USDT0 | typeof USDRIF

/**
 * Token information for swapping
 */
export interface SwapToken {
  symbol: SwapTokenSymbol
  address: Address
  name: string
  decimals?: number // Optional - should be fetched from contract to avoid errors
}

/**
 * Swap direction - which token is being swapped from/to
 */
export interface SwapDirection {
  from: SwapTokenSymbol
  to: SwapTokenSymbol
}

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
  amountOut: bigint // Expected output amount (always present)
  gasEstimate: bigint // Estimated gas for the swap
  feeTier: number // Pool fee tier: 100 (0.01%), 500 (0.05%), 3000 (0.3%), 10000 (1%)
  timestamp: number // When quote was fetched (for expiry checks)
  amountIn?: bigint // Required input amount (only present for exactOut quotes)
  sqrtPriceX96After?: bigint // Price after swap (optional, for advanced use)
  initializedTicksCrossed?: bigint // Ticks crossed (optional, for gas estimation)
}

/**
 * Central swap state managed by SwappingContext.
 * Shared across all swap steps (input, allowance, confirmation).
 */
export interface SwapState {
  // Which tokens are being swapped
  tokenIn: SwapTokenSymbol
  tokenOut: SwapTokenSymbol

  // Bidirectional input: stores the amount user typed and which field they're editing
  mode: SwapMode
  typedAmount: string

  // Quote data
  quote: QuoteResult | null
  isQuoting: boolean
  quoteError: Error | null

  // Swap execution
  isSwapping: boolean
  swapError: Error | null
  swapTxHash: string | null

  // Allowance
  allowance: bigint | null
  isCheckingAllowance: boolean
  isApproving: boolean
  approvalTxHash: string | null

  // Permit2 signing
  permit: PermitSingle | null
  permitSignature: Hex | null
  isSigning: boolean

  // Pool data
  poolAddress: Address | null
  poolFee: number | null
}

/**
 * Action type enum for swap reducer
 */
export enum SwapActionType {
  SET_TOKEN_IN = 'SET_TOKEN_IN',
  SET_TOKEN_OUT = 'SET_TOKEN_OUT',
  SET_SWAP_INPUT = 'SET_SWAP_INPUT',
  SET_QUOTE = 'SET_QUOTE',
  SET_QUOTING = 'SET_QUOTING',
  SET_QUOTE_ERROR = 'SET_QUOTE_ERROR',
  SET_SWAPPING = 'SET_SWAPPING',
  SET_SWAP_ERROR = 'SET_SWAP_ERROR',
  SET_SWAP_TX_HASH = 'SET_SWAP_TX_HASH',
  SET_ALLOWANCE = 'SET_ALLOWANCE',
  SET_CHECKING_ALLOWANCE = 'SET_CHECKING_ALLOWANCE',
  SET_APPROVING = 'SET_APPROVING',
  SET_APPROVAL_TX_HASH = 'SET_APPROVAL_TX_HASH',
  SET_PERMIT = 'SET_PERMIT',
  SET_PERMIT_SIGNATURE = 'SET_PERMIT_SIGNATURE',
  SET_SIGNING = 'SET_SIGNING',
  SET_POOL_ADDRESS = 'SET_POOL_ADDRESS',
  SET_POOL_FEE = 'SET_POOL_FEE',
  RESET_SWAP = 'RESET_SWAP',
}

/**
 * Actions for updating swap state
 */
export type SwapAction =
  | { type: SwapActionType.SET_TOKEN_IN; payload: SwapTokenSymbol }
  | { type: SwapActionType.SET_TOKEN_OUT; payload: SwapTokenSymbol }
  | { type: SwapActionType.SET_SWAP_INPUT; payload: { mode: SwapMode; typedAmount: string } }
  | { type: SwapActionType.SET_QUOTE; payload: QuoteResult }
  | { type: SwapActionType.SET_QUOTING; payload: boolean }
  | { type: SwapActionType.SET_QUOTE_ERROR; payload: Error | null }
  | { type: SwapActionType.SET_SWAPPING; payload: boolean }
  | { type: SwapActionType.SET_SWAP_ERROR; payload: Error | null }
  | { type: SwapActionType.SET_SWAP_TX_HASH; payload: string | null }
  | { type: SwapActionType.SET_ALLOWANCE; payload: bigint | null }
  | { type: SwapActionType.SET_CHECKING_ALLOWANCE; payload: boolean }
  | { type: SwapActionType.SET_APPROVING; payload: boolean }
  | { type: SwapActionType.SET_APPROVAL_TX_HASH; payload: string | null }
  | { type: SwapActionType.SET_PERMIT; payload: PermitSingle | null }
  | { type: SwapActionType.SET_PERMIT_SIGNATURE; payload: Hex | null }
  | { type: SwapActionType.SET_SIGNING; payload: boolean }
  | { type: SwapActionType.SET_POOL_ADDRESS; payload: Address | null }
  | { type: SwapActionType.SET_POOL_FEE; payload: number | null }
  | { type: SwapActionType.RESET_SWAP }

/**
 * Token balances and prices for swap tokens
 * Raw values only - formatting should be done at display time
 */
export interface SwapTokenData {
  balances: Record<SwapTokenSymbol, string> // Raw balance strings
  prices: Record<SwapTokenSymbol, number> // Raw price numbers
  isLoading: boolean
}

/**
 * Context value interface
 */
export interface SwappingContextValue {
  // State
  state: SwapState

  // Available tokens
  tokens: Record<SwapTokenSymbol, SwapToken>

  // Token balances and prices (fetched once in provider)
  tokenData: SwapTokenData

  // Actions
  setTokenIn: (token: SwapTokenSymbol) => void
  setTokenOut: (token: SwapTokenSymbol) => void
  toggleTokenSelection: () => void
  setSwapInput: (mode: SwapMode, typedAmount: string) => void
  resetSwap: () => void

  // Swap execution state management - contract calls should be in hooks using useWriteContract
  setSwapping: (isSwapping: boolean) => void
  setSwapError: (error: Error | null) => void
  setSwapTxHash: (txHash: string | null) => void

  // State management functions for hooks (internal use)
  setQuoting: (isQuoting: boolean) => void
  setQuote: (quote: QuoteResult | null) => void
  setQuoteError: (error: Error | null) => void
  setCheckingAllowance: (isChecking: boolean) => void
  setAllowance: (allowance: bigint | null) => void
  setApproving: (isApproving: boolean) => void
  setApprovalTxHash: (txHash: string | null) => void
  setPoolFee: (fee: number) => void
  setPermit: (permit: PermitSingle | null) => void
  setPermitSignature: (signature: Hex | null) => void
  setSigning: (isSigning: boolean) => void
}
