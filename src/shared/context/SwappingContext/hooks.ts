'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useSwappingContext } from './SwappingContext'
import { UNISWAP_UNIVERSAL_ROUTER_ADDRESS } from '@/lib/constants'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { QuoteResult } from './types'
import { uniswapProvider } from '@/lib/swap/providers/uniswap'

/**
 * Hook for managing swap input amount and getting quotes
 * Uses the existing uniswapProvider which has:
 * - Multiple fee tier fallback logic
 * - Proper error handling
 * - Comprehensive tests
 */
export const useSwapInput = () => {
  const { state, setAmountIn, tokens, setQuoting, setQuote, setQuoteError } = useSwappingContext()
  const { amountIn, tokenIn, tokenOut, quote, isQuoting, quoteError, poolFee } = state

  // Get quote using the existing uniswapProvider (tested, handles multiple fee tiers)
  const {
    data: swapQuote,
    isLoading: isQuoteLoading,
    error: quoteErrorData,
  } = useQuery({
    queryKey: ['swapQuote', tokenIn, tokenOut, amountIn, poolFee],
    queryFn: async () => {
      if (!amountIn || amountIn === '' || !tokens[tokenIn].decimals || !tokens[tokenOut].decimals) {
        return null
      }

      try {
        const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)
        if (amountInBigInt <= 0n) {
          return null
        }

        // Use the existing provider which handles fee tier fallback
        const result = await uniswapProvider.getQuote({
          tokenIn: tokens[tokenIn].address,
          tokenOut: tokens[tokenOut].address,
          amountIn: amountInBigInt,
          tokenInDecimals: tokens[tokenIn].decimals,
          tokenOutDecimals: tokens[tokenOut].decimals,
          feeTier: poolFee || undefined, // If poolFee is set, use it; otherwise let provider try all tiers
        })

        // Convert SwapQuote to QuoteResult format
        if (result.error) {
          throw new Error(result.error)
        }

        return {
          amountOut: BigInt(result.amountOutRaw),
          gasEstimate: result.gasEstimate ? BigInt(result.gasEstimate) : 0n,
          timestamp: Date.now(), // Track when quote was fetched
        } as QuoteResult
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to get quote')
      }
    },
    enabled: !!amountIn && amountIn !== '' && !!tokens[tokenIn].decimals && !!tokens[tokenOut].decimals,
    staleTime: 30_000, // 30 seconds - quotes are time-sensitive
    refetchInterval: 60_000, // Refetch every minute for fresh quotes
  })

  // Update state when quote result changes
  useEffect(() => {
    if (isQuoteLoading) {
      console.log('isQuoteLoading', isQuoteLoading)
      setQuoting(true)
      setQuoteError(null)
    } else if (quoteErrorData) {
      const err = quoteErrorData instanceof Error ? quoteErrorData : new Error('Failed to get quote')
      console.log('quoteErrorData', quoteErrorData)
      setQuoteError(err)
      setQuoting(false)
    } else if (swapQuote) {
      console.log('swapQuote', swapQuote)
      setQuote(swapQuote)
    }
  }, [swapQuote, isQuoteLoading, quoteErrorData, setQuoting, setQuote, setQuoteError])

  // Format amount out from quote
  const formattedAmountOut = useMemo(() => {
    if (!quote || !quote.amountOut || !tokens[tokenOut].decimals) {
      return null
    }
    try {
      return formatUnits(quote.amountOut, tokens[tokenOut].decimals)
    } catch {
      return null
    }
  }, [quote, tokens, tokenOut])

  // Check if quote is expired (30 seconds TTL for swap quotes)
  const QUOTE_TTL_MS = 30_000 // 30 seconds
  const isQuoteExpired = useMemo(() => {
    if (!quote || !quote.timestamp) {
      return false
    }
    const age = Date.now() - quote.timestamp
    return age > QUOTE_TTL_MS
  }, [quote])

  return {
    amountIn,
    setAmountIn,
    formattedAmountOut,
    quote,
    isQuoting,
    quoteError,
    isQuoteExpired,
  }
}

/**
 * Hook for token selection and swapping
 */
export const useTokenSelection = () => {
  const { state, setTokenIn, setTokenOut, toggleTokenSelection, tokens } = useSwappingContext()
  const { tokenIn, tokenOut } = state

  const handleToggleTokenSelection = useCallback(() => {
    toggleTokenSelection()
  }, [toggleTokenSelection])

  return {
    tokenIn,
    tokenOut,
    tokenInData: tokens[tokenIn],
    tokenOutData: tokens[tokenOut],
    setTokenIn,
    setTokenOut,
    toggleTokenSelection: handleToggleTokenSelection,
  }
}

/**
 * Hook for checking and managing token allowances for the swap router
 * Follows the same pattern as useVaultAllowance - uses router address as a constant
 */
export const useTokenAllowance = () => {
  const { state, tokens, setCheckingAllowance, setAllowance, setApproving, setApprovalTxHash } =
    useSwappingContext()
  const { tokenIn, allowance, isCheckingAllowance, isApproving } = state
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  // Read allowance using useReadContract hook
  const { data: allowanceData, isLoading: isAllowanceLoading } = useReadContract({
    address: tokens[tokenIn].address,
    abi: RIFTokenAbi,
    functionName: 'allowance',
    args:
      address && UNISWAP_UNIVERSAL_ROUTER_ADDRESS ? [address, UNISWAP_UNIVERSAL_ROUTER_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
      refetchInterval: 5000,
    },
  })

  // Update state when allowance changes
  useEffect(() => {
    if (isAllowanceLoading) {
      setCheckingAllowance(true)
    } else if (allowanceData !== undefined) {
      setAllowance(typeof allowanceData === 'bigint' ? allowanceData : null)
    }
  }, [allowanceData, isAllowanceLoading, setCheckingAllowance, setAllowance])

  const hasSufficientAllowance = useCallback(
    (requiredAmount: bigint) => {
      if (!allowance) {
        return false
      }
      return allowance >= requiredAmount
    },
    [allowance],
  )

  const approve = useCallback(
    async (amount: bigint) => {
      if (!address || !writeContractAsync || !UNISWAP_UNIVERSAL_ROUTER_ADDRESS) {
        return null
      }

      setApproving(true)
      setApprovalTxHash(null)

      try {
        const hash = await writeContractAsync({
          address: tokens[tokenIn].address,
          abi: RIFTokenAbi,
          functionName: 'approve',
          args: [UNISWAP_UNIVERSAL_ROUTER_ADDRESS, amount],
        })
        setApprovalTxHash(hash)
        return hash
      } catch (error) {
        setApproving(false)
        return null
      }
    },
    [address, writeContractAsync, tokenIn, tokens, setApproving, setApprovalTxHash],
  )

  // Update approving state based on write contract status
  useEffect(() => {
    if (isWritePending) {
      setApproving(true)
    }
  }, [isWritePending, setApproving])

  return {
    allowance,
    isCheckingAllowance: isCheckingAllowance || isAllowanceLoading,
    isApproving: isApproving || isWritePending,
    hasSufficientAllowance,
    approve,
    tokenAddress: tokens[tokenIn].address,
  }
}

/**
 * Hook for executing swaps
 * TODO: Implement with Uniswap Universal Router
 * Universal Router uses execute(commands, inputs) pattern which is more complex
 * This requires encoding the swap command and inputs properly
 */
export const useSwapExecution = () => {
  const { state, tokens, setSwapping, setSwapError, setSwapTxHash } = useSwappingContext()
  const { tokenIn, tokenOut, amountIn, quote, isSwapping, swapError, swapTxHash, poolFee } = state
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  const execute = useCallback(
    async (slippageTolerance: number = 0.5) => {
      if (!address || !amountIn || !quote || !poolFee || !tokens[tokenIn].decimals || !writeContractAsync) {
        return null
      }

      setSwapping(true)
      setSwapError(null)

      try {
        const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)
        const amountOutMinimum =
          quote.amountOut - (quote.amountOut * BigInt(Math.floor(slippageTolerance * 100))) / 10000n
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 minutes from now

        // TODO: Implement with Uniswap Universal Router
        // Universal Router uses execute(commands, inputs) pattern which is more complex
        // This requires encoding the swap command and inputs properly
        // For now, return null to indicate not fully implemented

        setSwapping(false)
        return null
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to execute swap')
        setSwapError(err)
        return null
      }
    },
    [address, amountIn, quote, tokenIn, poolFee, tokens, writeContractAsync, setSwapping, setSwapError],
  )

  // Update swapping state based on write contract status
  useEffect(() => {
    if (isWritePending) {
      setSwapping(true)
    }
  }, [isWritePending, setSwapping])

  return {
    execute,
    isSwapping: isSwapping || isWritePending,
    swapError,
    swapTxHash,
    canExecute: !!address && !!amountIn && !!quote && !!poolFee,
  }
}
