'use client'

import { FC, ReactNode, useCallback, useMemo, useReducer } from 'react'
import { SwappingContext } from './SwappingContext'
import {
  QuoteResult,
  SwapAction,
  SwapActionType,
  SwapState,
  SwapToken,
  SwapTokenSymbol,
  SwappingContextValue,
} from './types'
import {
  USDRIF,
  USDRIF_ADDRESS,
  USDT0,
  USDT0_ADDRESS,
  USDT0_USDRIF_POOL_ADDRESS,
  UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
} from '@/lib/constants'

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
  amountIn: '',
  amountOut: null,
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
  poolAddress: USDT0_USDRIF_POOL_ADDRESS,
  poolFee: DEFAULT_POOL_FEE,
}

const swapReducer = (state: SwapState, action: SwapAction): SwapState => {
  switch (action.type) {
    case SwapActionType.SET_TOKEN_IN:
      return {
        ...state,
        tokenIn: action.payload,
        amountIn: '',
        amountOut: null,
        quote: null,
        quoteError: null,
      }
    case SwapActionType.SET_TOKEN_OUT:
      return {
        ...state,
        tokenOut: action.payload,
        amountIn: '',
        amountOut: null,
        quote: null,
        quoteError: null,
      }
    case SwapActionType.SET_AMOUNT_IN:
      return {
        ...state,
        amountIn: action.payload,
        amountOut: null,
        quote: null,
        quoteError: null,
      }
    case SwapActionType.SET_AMOUNT_OUT:
      return {
        ...state,
        amountOut: action.payload,
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
  const tokens = useMemo(() => getSwapTokens(), [])

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

  const setAmountIn = useCallback((amount: string) => {
    dispatch({ type: SwapActionType.SET_AMOUNT_IN, payload: amount })
  }, [])

  const resetSwap = useCallback(() => {
    dispatch({ type: SwapActionType.RESET_SWAP })
  }, [])

  // Quote function - to be implemented with Quoter contract
  const getQuote = useCallback(
    async (
      amountIn: bigint,
      tokenIn: SwapTokenSymbol,
      tokenOut: SwapTokenSymbol,
    ): Promise<QuoteResult | null> => {
      if (!amountIn || amountIn === 0n) {
        return null
      }

      dispatch({ type: SwapActionType.SET_QUOTING, payload: true })
      dispatch({ type: SwapActionType.SET_QUOTE_ERROR, payload: null })

      try {
        // TODO: Implement with Uniswap Quoter contract
        // This is a placeholder that should be replaced when Quoter contract is available
        // Example implementation:
        // const quoterAddress = QUOTER_ADDRESS
        // const quoterAbi = QuoterAbi
        // const result = await readContract({
        //   address: quoterAddress,
        //   abi: quoterAbi,
        //   functionName: 'quoteExactInputSingle',
        //   args: [
        //     SWAP_TOKENS[tokenIn].address,
        //     SWAP_TOKENS[tokenOut].address,
        //     state.poolFee || DEFAULT_POOL_FEE,
        //     amountIn,
        //     0n, // sqrtPriceLimitX96
        //   ],
        // })

        // For now, return null to indicate not implemented
        // When implemented, dispatch the result:
        // dispatch({ type: SwapActionType.SET_QUOTE, payload: result })
        // dispatch({ type: SwapActionType.SET_QUOTING, payload: false })

        dispatch({ type: SwapActionType.SET_QUOTING, payload: false })
        return null
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to get quote')
        dispatch({ type: SwapActionType.SET_QUOTE_ERROR, payload: err })
        return null
      }
    },
    [],
  )

  // Swap execution - to be implemented with Router contract
  const executeSwap = useCallback(
    async (
      amountIn: bigint,
      amountOutMinimum: bigint,
      tokenIn: SwapTokenSymbol,
      tokenOut: SwapTokenSymbol,
      deadline: bigint,
    ): Promise<string | null> => {
      dispatch({ type: SwapActionType.SET_SWAPPING, payload: true })
      dispatch({ type: SwapActionType.SET_SWAP_ERROR, payload: null })

      try {
        // TODO: Implement with Uniswap Router contract
        // This is a placeholder that should be replaced when Router contract is available
        // Example implementation:
        // const routerAddress = UNISWAP_ROUTER_ADDRESS
        // const routerAbi = RouterAbi
        // const hash = await writeContract({
        //   address: routerAddress,
        //   abi: routerAbi,
        //   functionName: 'exactInputSingle',
        //   args: [{
        //     tokenIn: SWAP_TOKENS[tokenIn].address,
        //     tokenOut: SWAP_TOKENS[tokenOut].address,
        //     fee: state.poolFee || DEFAULT_POOL_FEE,
        //     recipient: userAddress,
        //     deadline,
        //     amountIn,
        //     amountOutMinimum,
        //     sqrtPriceLimitX96: 0n,
        //   }],
        // })
        // dispatch({ type: SwapActionType.SET_SWAP_TX_HASH, payload: hash })
        // dispatch({ type: SwapActionType.SET_SWAPPING, payload: false })

        dispatch({ type: SwapActionType.SET_SWAPPING, payload: false })
        return null
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to execute swap')
        dispatch({ type: SwapActionType.SET_SWAP_ERROR, payload: err })
        return null
      }
    },
    [],
  )

  // Check allowance - to be implemented with ERC20 contract
  const checkAllowance = useCallback(async (token: SwapTokenSymbol): Promise<bigint | null> => {
    if (!UNISWAP_UNIVERSAL_ROUTER_ADDRESS) {
      return null
    }

    dispatch({ type: SwapActionType.SET_CHECKING_ALLOWANCE, payload: true })

    try {
      // TODO: Implement with ERC20 contract
      // This is a placeholder that should be replaced when token contracts are available
      // Example implementation:
      // const tokenAddress = tokens[token].address
      // const tokenAbi = ERC20Abi
      // const { address: userAddress } = useAccount()
      // const allowance = await readContract({
      //   address: tokenAddress,
      //   abi: tokenAbi,
      //   functionName: 'allowance',
      //   args: [userAddress, UNISWAP_ROUTER_ADDRESS],
      // })
      // dispatch({ type: SwapActionType.SET_ALLOWANCE, payload: allowance })
      // dispatch({ type: SwapActionType.SET_CHECKING_ALLOWANCE, payload: false })

      dispatch({ type: SwapActionType.SET_CHECKING_ALLOWANCE, payload: false })
      return null
    } catch (error) {
      dispatch({ type: SwapActionType.SET_CHECKING_ALLOWANCE, payload: false })
      return null
    }
  }, [])

  // Approve token - to be implemented with ERC20 contract
  const approveToken = useCallback(async (token: SwapTokenSymbol, amount: bigint): Promise<string | null> => {
    if (!UNISWAP_UNIVERSAL_ROUTER_ADDRESS) {
      return null
    }

    dispatch({ type: SwapActionType.SET_APPROVING, payload: true })
    dispatch({ type: SwapActionType.SET_APPROVAL_TX_HASH, payload: null })

    try {
      // TODO: Implement with ERC20 contract
      // This is a placeholder that should be replaced when token contracts are available
      // Example implementation:
      // const tokenAddress = tokens[token].address
      // const tokenAbi = ERC20Abi
      // const hash = await writeContract({
      //   address: tokenAddress,
      //   abi: tokenAbi,
      //   functionName: 'approve',
      //   args: [UNISWAP_ROUTER_ADDRESS, amount],
      // })
      // dispatch({ type: SwapActionType.SET_APPROVAL_TX_HASH, payload: hash })
      // dispatch({ type: SwapActionType.SET_APPROVING, payload: false })

      dispatch({ type: SwapActionType.SET_APPROVING, payload: false })
      return null
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to approve token')
      dispatch({ type: SwapActionType.SET_APPROVING, payload: false })
      return null
    }
  }, [])

  const value: SwappingContextValue = useMemo(
    () => ({
      state,
      tokens,
      setTokenIn,
      setTokenOut,
      toggleTokenSelection,
      setAmountIn,
      resetSwap,
      getQuote,
      executeSwap,
      checkAllowance,
      approveToken,
    }),
    [
      state,
      tokens,
      setTokenIn,
      setTokenOut,
      toggleTokenSelection,
      setAmountIn,
      resetSwap,
      getQuote,
      executeSwap,
      checkAllowance,
      approveToken,
    ],
  )

  return <SwappingContext.Provider value={value}>{children}</SwappingContext.Provider>
}
