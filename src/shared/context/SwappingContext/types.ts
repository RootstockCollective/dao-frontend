import { USDRIF, USDT0 } from '@/lib/constants'
import { Address } from 'viem'

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
 * Quote result from Uniswap Quoter
 */
export interface QuoteResult {
  amountOut: bigint
  sqrtPriceX96After: bigint
  initializedTicksCrossed: bigint
  gasEstimate: bigint
}

/**
 * Swap state managed by the context
 */
export interface SwapState {
  // Token selection
  tokenIn: SwapTokenSymbol
  tokenOut: SwapTokenSymbol

  // Amounts
  amountIn: string
  amountOut: string | null

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
  SET_AMOUNT_IN = 'SET_AMOUNT_IN',
  SET_AMOUNT_OUT = 'SET_AMOUNT_OUT',
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
  | { type: SwapActionType.SET_AMOUNT_IN; payload: string }
  | { type: SwapActionType.SET_AMOUNT_OUT; payload: string | null }
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
  | { type: SwapActionType.SET_POOL_ADDRESS; payload: Address | null }
  | { type: SwapActionType.SET_POOL_FEE; payload: number | null }
  | { type: SwapActionType.RESET_SWAP }

/**
 * Context value interface
 */
export interface SwappingContextValue {
  // State
  state: SwapState

  // Available tokens
  tokens: Record<SwapTokenSymbol, SwapToken>

  // Actions
  setTokenIn: (token: SwapTokenSymbol) => void
  setTokenOut: (token: SwapTokenSymbol) => void
  toggleTokenSelection: () => void
  setAmountIn: (amount: string) => void
  resetSwap: () => void

  // Quote functions (to be implemented with Quoter contract)
  getQuote: (
    amountIn: bigint,
    tokenIn: SwapTokenSymbol,
    tokenOut: SwapTokenSymbol,
  ) => Promise<QuoteResult | null>

  // Swap execution (to be implemented with Router contract)
  executeSwap: (
    amountIn: bigint,
    amountOutMinimum: bigint,
    tokenIn: SwapTokenSymbol,
    tokenOut: SwapTokenSymbol,
    deadline: bigint,
  ) => Promise<string | null>

  // Allowance functions
  checkAllowance: (token: SwapTokenSymbol) => Promise<bigint | null>
  approveToken: (token: SwapTokenSymbol, amount: bigint) => Promise<string | null>
}
