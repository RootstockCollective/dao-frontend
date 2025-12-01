'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useSwappingContext } from './SwappingContext'

/**
 * Hook for managing swap input amount and getting quotes
 */
export const useSwapInput = () => {
  const { state, setAmountIn, getQuote, tokens } = useSwappingContext()
  const { amountIn, tokenIn, tokenOut, quote, isQuoting, quoteError } = state

  // Get quote when amount changes
  useEffect(() => {
    if (amountIn && amountIn !== '' && !isQuoting && tokens[tokenIn].decimals) {
      try {
        const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)
        if (amountInBigInt > 0n) {
          getQuote(amountInBigInt, tokenIn, tokenOut)
        }
      } catch (error) {
        // Invalid input, ignore
      }
    }
  }, [amountIn, tokenIn, tokenOut, getQuote, tokens, isQuoting])

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

  return {
    amountIn,
    setAmountIn,
    formattedAmountOut,
    quote,
    isQuoting,
    quoteError,
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
  const { state, checkAllowance, approveToken, tokens } = useSwappingContext()
  const { tokenIn, allowance, isCheckingAllowance, isApproving } = state
  const { address } = useAccount()

  // Check allowance when token or user address changes
  useEffect(() => {
    if (address) {
      checkAllowance(tokenIn)
    }
  }, [address, tokenIn, checkAllowance])

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
      if (!address) {
        return null
      }
      return approveToken(tokenIn, amount)
    },
    [address, tokenIn, approveToken],
  )

  return {
    allowance,
    isCheckingAllowance,
    isApproving,
    hasSufficientAllowance,
    approve,
    tokenAddress: tokens[tokenIn].address,
  }
}

/**
 * Hook for executing swaps
 */
export const useSwapExecution = () => {
  const { state, executeSwap, tokens } = useSwappingContext()
  const { tokenIn, tokenOut, amountIn, quote, isSwapping, swapError, swapTxHash, poolFee } = state
  const { address } = useAccount()

  const execute = useCallback(
    async (slippageTolerance: number = 0.5) => {
      if (!address || !amountIn || !quote || !poolFee || !tokens[tokenIn].decimals) {
        return null
      }

      try {
        const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)
        const amountOutMinimum =
          quote.amountOut - (quote.amountOut * BigInt(Math.floor(slippageTolerance * 100))) / 10000n
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 minutes from now

        return executeSwap(amountInBigInt, amountOutMinimum, tokenIn, tokenOut, deadline)
      } catch (error) {
        return null
      }
    },
    [address, amountIn, quote, tokenIn, tokenOut, poolFee, tokens, executeSwap],
  )

  return {
    execute,
    isSwapping,
    swapError,
    swapTxHash,
    canExecute: !!address && !!amountIn && !!quote && !!poolFee,
  }
}
