'use client'

import { FC, ReactNode, useCallback, useMemo, useReducer } from 'react'
import { useReadContracts } from 'wagmi'
import { SwappingContext } from './SwappingContext'
import {
  QuoteResult,
  SwapAction,
  SwapActionType,
  SwapState,
  SwapToken,
  SwapTokenSymbol,
  SwappingContextValue,
  SwapTokenData,
  SwapMode,
} from './types'
import { USDRIF, USDRIF_ADDRESS, USDT0, USDT0_ADDRESS, USDT0_USDRIF_POOL_ADDRESS } from '@/lib/constants'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { Address, Hex } from 'viem'
import { PermitSingle } from '@/lib/swap/permit2'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'

// Default pool fee - should be read from pool contract via fee() function when pool ABI is available
// For stablecoin pairs (USDT0/USDRIF), typical fees are:
// - 0.01% = 100 (most common for stablecoins)
// - 0.05% = 500 (also common for stablecoins)
// - 0.3% = 3000 (less common for stablecoins)
// - 1% = 10000 (rare for stablecoins)
// Default set to 100 (0.01%) as most stablecoin pairs use this tier
// TODO: Read actual fee from pool contract when pool ABI is available
const DEFAULT_POOL_FEE = 100

/**
 * Get swap tokens configuration
 * This function can be extended to support more tokens in the future
 * by adding them to the returned object
 */
const getSwapTokens = (): Record<SwapTokenSymbol, SwapToken> => {
  return {
    USDT0: {
      symbol: USDT0,
      address: USDT0_ADDRESS,
      // decimals should be fetched from contract - do not hardcode
      name: USDT0,
    },
    USDRIF: {
      symbol: USDRIF,
      address: USDRIF_ADDRESS,
      // decimals should be fetched from contract - do not hardcode
      name: USDRIF,
    },
  }
}

const initialState: SwapState = {
  tokenIn: USDT0,
  tokenOut: USDRIF,
  mode: 'exactIn',
  typedAmount: '',
  quote: null,
  isQuoting: false,
  quoteError: null,
  isSwapping: false,
  swapError: null,
  swapTxHash: null,
  allowance: null,
  isCheckingAllowance: false,
  isApproving: false,
  approvalTxHash: null,
  permit: null,
  permitSignature: null,
  isSigning: false,
  poolAddress: USDT0_USDRIF_POOL_ADDRESS,
  poolFee: DEFAULT_POOL_FEE,
}

const swapReducer = (state: SwapState, action: SwapAction): SwapState => {
  switch (action.type) {
    case SwapActionType.SET_TOKEN_IN:
      return {
        ...state,
        tokenIn: action.payload,
        typedAmount: '',
        quote: null,
        quoteError: null,
      }
    case SwapActionType.SET_TOKEN_OUT:
      return {
        ...state,
        tokenOut: action.payload,
        typedAmount: '',
        quote: null,
        quoteError: null,
      }
    case SwapActionType.SET_SWAP_INPUT:
      // Called when user edits either input field. Clears the existing quote
      // so useSwapInput will fetch a new one based on the updated values.
      return {
        ...state,
        mode: action.payload.mode,
        typedAmount: action.payload.typedAmount,
        quote: null,
        quoteError: null,
      }
    case SwapActionType.SET_QUOTE:
      return {
        ...state,
        quote: action.payload,
        quoteError: null,
      }
    case SwapActionType.SET_QUOTING:
      return {
        ...state,
        isQuoting: action.payload,
      }
    case SwapActionType.SET_QUOTE_ERROR:
      return {
        ...state,
        quote: action.payload ? null : state.quote, // Clear quote when error is set
        quoteError: action.payload,
        isQuoting: false,
      }
    case SwapActionType.SET_SWAPPING:
      return {
        ...state,
        isSwapping: action.payload,
      }
    case SwapActionType.SET_SWAP_ERROR:
      return {
        ...state,
        swapError: action.payload,
        isSwapping: false,
      }
    case SwapActionType.SET_SWAP_TX_HASH:
      return {
        ...state,
        swapTxHash: action.payload,
      }
    case SwapActionType.SET_ALLOWANCE:
      return {
        ...state,
        allowance: action.payload,
      }
    case SwapActionType.SET_CHECKING_ALLOWANCE:
      return {
        ...state,
        isCheckingAllowance: action.payload,
      }
    case SwapActionType.SET_APPROVING:
      return {
        ...state,
        isApproving: action.payload,
      }
    case SwapActionType.SET_APPROVAL_TX_HASH:
      return {
        ...state,
        approvalTxHash: action.payload,
      }
    case SwapActionType.SET_PERMIT:
      return {
        ...state,
        permit: action.payload,
      }
    case SwapActionType.SET_PERMIT_SIGNATURE:
      return {
        ...state,
        permitSignature: action.payload,
      }
    case SwapActionType.SET_SIGNING:
      return {
        ...state,
        isSigning: action.payload,
      }
    case SwapActionType.SET_POOL_ADDRESS:
      return {
        ...state,
        poolAddress: action.payload,
      }
    case SwapActionType.SET_POOL_FEE:
      return {
        ...state,
        poolFee: action.payload,
      }
    case SwapActionType.RESET_SWAP:
      return {
        ...initialState,
        tokenIn: state.tokenIn,
        tokenOut: state.tokenOut,
        poolAddress: state.poolAddress,
        poolFee: state.poolFee,
      }
    default:
      return state
  }
}

interface SwappingProviderProps {
  children: ReactNode
}

export const SwappingProvider: FC<SwappingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(swapReducer, initialState)

  // Fetch balances and prices once from BalancesContext
  const { balances, prices, isBalancesLoading } = useBalancesContext()

  // Raw token data - formatting should be done at display time
  const tokenData: SwapTokenData = useMemo(
    () => ({
      balances: {
        [USDT0]: balances[USDT0]?.balance || '0',
        [USDRIF]: balances[USDRIF]?.balance || '0',
      },
      prices: {
        [USDT0]: prices[USDT0]?.price || 0,
        [USDRIF]: prices[USDRIF]?.price || 0,
      },
      isLoading: isBalancesLoading,
    }),
    [balances, prices, isBalancesLoading],
  )

  // Fetch decimals directly from contracts
  const { data: decimalsData } = useReadContracts({
    contracts: [
      {
        address: USDT0_ADDRESS as Address,
        abi: RIFTokenAbi,
        functionName: 'decimals',
      },
      {
        address: USDRIF_ADDRESS as Address,
        abi: RIFTokenAbi,
        functionName: 'decimals',
      },
    ],
  })

  // Build tokens with decimals from contract calls
  const tokens = useMemo(() => {
    const baseTokens = getSwapTokens()
    const updatedTokens: Record<SwapTokenSymbol, SwapToken> = { ...baseTokens }

    // USDT0 decimals (index 0)
    if (decimalsData?.[0]?.result && typeof decimalsData[0].result === 'number') {
      updatedTokens[USDT0] = {
        ...updatedTokens[USDT0],
        decimals: decimalsData[0].result,
      }
    }

    // USDRIF decimals (index 1)
    if (decimalsData?.[1]?.result && typeof decimalsData[1].result === 'number') {
      updatedTokens[USDRIF] = {
        ...updatedTokens[USDRIF],
        decimals: decimalsData[1].result,
      }
    }

    return updatedTokens
  }, [decimalsData])

  const setTokenIn = useCallback((token: SwapTokenSymbol) => {
    dispatch({ type: SwapActionType.SET_TOKEN_IN, payload: token })
  }, [])

  const setTokenOut = useCallback((token: SwapTokenSymbol) => {
    dispatch({ type: SwapActionType.SET_TOKEN_OUT, payload: token })
  }, [])

  const toggleTokenSelection = useCallback(() => {
    dispatch({ type: SwapActionType.SET_TOKEN_IN, payload: state.tokenOut })
    dispatch({ type: SwapActionType.SET_TOKEN_OUT, payload: state.tokenIn })
  }, [state.tokenIn, state.tokenOut])

  const setSwapInput = useCallback((mode: SwapMode, typedAmount: string) => {
    dispatch({ type: SwapActionType.SET_SWAP_INPUT, payload: { mode, typedAmount } })
  }, [])

  const resetSwap = useCallback(() => {
    dispatch({ type: SwapActionType.RESET_SWAP })
  }, [])

  // Quote state management functions - contract calls should be in hooks using useReadContract
  const setQuoting = useCallback((isQuoting: boolean) => {
    dispatch({ type: SwapActionType.SET_QUOTING, payload: isQuoting })
  }, [])

  const setQuote = useCallback((quote: QuoteResult | null) => {
    if (quote) {
      dispatch({ type: SwapActionType.SET_QUOTE, payload: quote })
      dispatch({ type: SwapActionType.SET_QUOTING, payload: false })
      dispatch({ type: SwapActionType.SET_QUOTE_ERROR, payload: null })
    }
  }, [])

  const setQuoteError = useCallback((error: Error | null) => {
    dispatch({ type: SwapActionType.SET_QUOTE_ERROR, payload: error })
    dispatch({ type: SwapActionType.SET_QUOTING, payload: false })
  }, [])

  // Swap execution state management functions - contract calls should be in hooks using useWriteContract
  const setSwapping = useCallback((isSwapping: boolean) => {
    dispatch({ type: SwapActionType.SET_SWAPPING, payload: isSwapping })
  }, [])

  const setSwapError = useCallback((error: Error | null) => {
    dispatch({ type: SwapActionType.SET_SWAP_ERROR, payload: error })
    dispatch({ type: SwapActionType.SET_SWAPPING, payload: false })
  }, [])

  const setSwapTxHash = useCallback((txHash: string | null) => {
    dispatch({ type: SwapActionType.SET_SWAP_TX_HASH, payload: txHash })
    dispatch({ type: SwapActionType.SET_SWAPPING, payload: false })
  }, [])

  // Allowance state management functions - contract calls should be in hooks using useReadContract
  const setCheckingAllowance = useCallback((isChecking: boolean) => {
    dispatch({ type: SwapActionType.SET_CHECKING_ALLOWANCE, payload: isChecking })
  }, [])

  const setAllowance = useCallback((allowance: bigint | null) => {
    dispatch({ type: SwapActionType.SET_ALLOWANCE, payload: allowance })
    dispatch({ type: SwapActionType.SET_CHECKING_ALLOWANCE, payload: false })
  }, [])

  // Approval state management functions - contract calls should be in hooks using useContractWrite
  const setApproving = useCallback((isApproving: boolean) => {
    dispatch({ type: SwapActionType.SET_APPROVING, payload: isApproving })
  }, [])

  const setApprovalTxHash = useCallback((txHash: string | null) => {
    dispatch({ type: SwapActionType.SET_APPROVAL_TX_HASH, payload: txHash })
    dispatch({ type: SwapActionType.SET_APPROVING, payload: false })
  }, [])

  const setPoolFee = useCallback((fee: number) => {
    dispatch({ type: SwapActionType.SET_POOL_FEE, payload: fee })
  // Permit signing state management
  const setPermit = useCallback((permit: PermitSingle | null) => {
    dispatch({ type: SwapActionType.SET_PERMIT, payload: permit })
  }, [])

  const setPermitSignature = useCallback((signature: Hex | null) => {
    dispatch({ type: SwapActionType.SET_PERMIT_SIGNATURE, payload: signature })
    dispatch({ type: SwapActionType.SET_SIGNING, payload: false })
  }, [])

  const setSigning = useCallback((isSigning: boolean) => {
    dispatch({ type: SwapActionType.SET_SIGNING, payload: isSigning })
  }, [])

  const value: SwappingContextValue = useMemo(
    () => ({
      state,
      tokens,
      tokenData,
      setTokenIn,
      setTokenOut,
      toggleTokenSelection,
      setSwapInput,
      resetSwap,
      // State management functions for hooks
      setQuoting,
      setQuote,
      setQuoteError,
      setCheckingAllowance,
      setAllowance,
      setApproving,
      setApprovalTxHash,
      setPermit,
      setPermitSignature,
      setSigning,
      setSwapping,
      setSwapError,
      setSwapTxHash,
      setPoolFee,
    }),
    [
      state,
      tokens,
      tokenData,
      setTokenIn,
      setTokenOut,
      toggleTokenSelection,
      setSwapInput,
      resetSwap,
      setQuoting,
      setQuote,
      setQuoteError,
      setCheckingAllowance,
      setAllowance,
      setApproving,
      setApprovalTxHash,
      setPermit,
      setPermitSignature,
      setSigning,
      setSwapping,
      setSwapError,
      setSwapTxHash,
      setPoolFee,
    ],
  )

  return <SwappingContext.Provider value={value}>{children}</SwappingContext.Provider>
}
