'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useSwappingContext } from './SwappingContext'
import { UNISWAP_UNIVERSAL_ROUTER_ADDRESS, PERMIT2_ADDRESS } from '@/lib/constants'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { Permit2Abi } from '@/lib/abis/Permit2Abi'
import { QuoteResult } from './types'
import { uniswapProvider, getSwapEncodedData } from '@/lib/swap/providers/uniswap'
import { UniswapUniversalRouterAbi } from '@/lib/abis/UniswapUniversalRouterAbi'

/**
 * Hook for managing swap input amount and getting quotes
 * Uses the existing uniswapProvider which has:
 * - Multiple fee tier fallback logic
 * - Proper error handling
 * - Comprehensive tests
 */
const QUOTE_DEBOUNCE_MS = 500 // Wait 500ms after user stops typing before fetching quote
const QUOTE_TIMEOUT_MS = 10_000 // 10 second timeout for quote fetching

/**
 * Wraps a promise with a timeout
 * If the promise doesn't resolve/reject within the timeout, it rejects with a timeout error
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ])
}

export const useSwapInput = () => {
  const { state, setAmountIn, tokens, setQuoting, setQuote, setQuoteError, setPoolFee } = useSwappingContext()
  const { amountIn, tokenIn, tokenOut, quote } = state

  // Debounce the amount to avoid fetching on every keystroke
  const [debouncedAmountIn] = useDebounce(amountIn, QUOTE_DEBOUNCE_MS)

  // Get quote using uniswapProvider with automatic fee tier fallback
  const {
    data: swapQuote,
    isLoading: isQuoteLoading,
    isFetching: isQuoteFetching,
    error: quoteError,
  } = useQuery({
    queryKey: ['swapQuote', tokenIn, tokenOut, debouncedAmountIn],
    queryFn: async () => {
      if (
        !debouncedAmountIn ||
        debouncedAmountIn === '' ||
        !tokens[tokenIn].decimals ||
        !tokens[tokenOut].decimals
      ) {
        return null
      }

      const amountInBigInt = parseUnits(debouncedAmountIn, tokens[tokenIn].decimals)
      if (amountInBigInt <= 0n) {
        return null
      }

      // Provider automatically tries default tier, then falls back to all tiers
      const result = await withTimeout(
        uniswapProvider.getQuote({
          tokenIn: tokens[tokenIn].address,
          tokenOut: tokens[tokenOut].address,
          amountIn: amountInBigInt,
          tokenInDecimals: tokens[tokenIn].decimals,
          tokenOutDecimals: tokens[tokenOut].decimals,
          // No feeTier param - let provider auto-detect the best available tier
        }),
        QUOTE_TIMEOUT_MS,
        'Quote request timed out. Please try again.',
      )

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.feeTier) {
        throw new Error('Quote missing fee tier information')
      }

      return {
        amountOut: BigInt(result.amountOutRaw),
        gasEstimate: result.gasEstimate ? BigInt(result.gasEstimate) : 0n,
        feeTier: result.feeTier,
        timestamp: Date.now(),
      } as QuoteResult
    },
    enabled:
      !!debouncedAmountIn &&
      debouncedAmountIn !== '' &&
      !!tokens[tokenIn].decimals &&
      !!tokens[tokenOut].decimals,
    staleTime: 30_000, // 30 seconds - quotes are time-sensitive
    refetchInterval: 60_000, // Refetch every minute for fresh quotes
    retry: false, // Don't retry failed quotes - show error immediately
  })

  // Sync quote to context and update poolFee when quote succeeds
  useEffect(() => {
    const isLoading = isQuoteLoading || isQuoteFetching
    setQuoting(isLoading)

    if (quoteError) {
      setQuoteError(quoteError instanceof Error ? quoteError : new Error(String(quoteError)))
    } else if (swapQuote) {
      setQuote(swapQuote)
      // Update poolFee to the tier that produced this quote
      // This ensures swap execution uses the same tier
      setPoolFee(swapQuote.feeTier)
    } else if (!isLoading) {
      setQuoteError(null)
    }
  }, [
    swapQuote,
    isQuoteLoading,
    isQuoteFetching,
    quoteError,
    setQuoting,
    setQuote,
    setQuoteError,
    setPoolFee,
  ])

  // Format amount out from quote
  // Return null if there's an error (React Query can have both stale data and new error)
  const formattedAmountOut = useMemo(() => {
    if (quoteError || !quote || !quote.amountOut || !tokens[tokenOut].decimals) {
      return null
    }
    try {
      return formatUnits(quote.amountOut, tokens[tokenOut].decimals)
    } catch {
      return null
    }
  }, [quote, quoteError, tokens, tokenOut])

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
    isQuoting: isQuoteLoading || isQuoteFetching,
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
  const { state, tokens, setApproving, setApprovalTxHash } = useSwappingContext()
  const { tokenIn, isApproving } = state
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  // Read Permit2 allowance (Universal Router uses Permit2 when payerIsUser: true)
  const {
    data: permit2AllowanceData,
    isLoading: isAllowanceLoading,
    isFetching: isAllowanceFetching,
    refetch: refetchAllowance,
  } = useReadContract({
    address: PERMIT2_ADDRESS,
    abi: Permit2Abi,
    functionName: 'allowance',
    args:
      address && tokens[tokenIn]?.address && UNISWAP_UNIVERSAL_ROUTER_ADDRESS
        ? [address, tokens[tokenIn].address, UNISWAP_UNIVERSAL_ROUTER_ADDRESS]
        : undefined,
    query: {
      enabled: !!address && !!tokens[tokenIn]?.address && !!UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
      refetchInterval: 5000,
    },
  })

  // Refetch on mount to ensure fresh data (prevents stale cache issues after swaps)
  useEffect(() => {
    refetchAllowance()
  }, [refetchAllowance])

  // Extract Permit2 allowance data (amount, expiration, nonce)
  const permit2Amount = useMemo(() => {
    if (!permit2AllowanceData || !Array.isArray(permit2AllowanceData)) return null
    return typeof permit2AllowanceData[0] === 'bigint' ? permit2AllowanceData[0] : null
  }, [permit2AllowanceData])

  const permit2Expiration = useMemo(() => {
    if (!permit2AllowanceData || !Array.isArray(permit2AllowanceData)) return null
    const exp = permit2AllowanceData[1]
    return typeof exp === 'bigint' ? exp : typeof exp === 'number' ? BigInt(exp) : null
  }, [permit2AllowanceData])

  // Check if allowance is sufficient AND not expired
  // Returns false while fetching to prevent auto-advance with stale data
  const hasSufficientAllowance = useCallback(
    (requiredAmount: bigint) => {
      // Don't return true while fetching - data might be stale
      if (isAllowanceFetching) {
        return false
      }
      if (permit2Amount === null || !permit2Expiration) {
        return false
      }
      // Check amount is sufficient
      if (permit2Amount < requiredAmount) {
        return false
      }
      // Check expiration (compare with current timestamp in seconds)
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))
      if (currentTimestamp > permit2Expiration) {
        return false // Allowance is expired
      }
      return true
    },
    [isAllowanceFetching, permit2Amount, permit2Expiration],
  )

  const approve = useCallback(
    async (amount: bigint) => {
      if (!address || !writeContractAsync || !UNISWAP_UNIVERSAL_ROUTER_ADDRESS) {
        throw new Error('Missing required parameters for approval')
      }

      if (!tokens[tokenIn]?.address) {
        throw new Error(`Token address not found for ${tokenIn}`)
      }

      setApproving(true)
      setApprovalTxHash(null)

      try {
        const { publicClient } = await import('@/lib/viemPublicClient')

        // Step 1: Check if ERC-20 allowance to Permit2 is already sufficient
        const existingErc20Allowance = await publicClient.readContract({
          address: tokens[tokenIn].address,
          abi: RIFTokenAbi,
          functionName: 'allowance',
          args: [address, PERMIT2_ADDRESS],
        })

        // Only request ERC-20 approval if insufficient
        if (existingErc20Allowance < amount) {
          const permit2ApprovalHash = await writeContractAsync({
            address: tokens[tokenIn].address,
            abi: RIFTokenAbi,
            functionName: 'approve',
            args: [PERMIT2_ADDRESS, amount],
          })

          if (!permit2ApprovalHash) {
            const rejectionError = new Error('User rejected the request')
            ;(rejectionError as any).cause = { code: 4001 }
            throw rejectionError
          }

          // Wait for ERC-20 approval to be confirmed before proceeding
          await publicClient.waitForTransactionReceipt({
            hash: permit2ApprovalHash,
          })
        }

        // Step 2: Set Permit2 allowance for Universal Router
        // Permit2.approve(token, spender, amount, expiration)
        // expiration: max uint48 (2^48 - 1) for no expiration
        // amount must be uint160, ensure it fits
        // uint48 max value is 281474976710655, which is within JavaScript safe integer range
        const maxExpiration = 2 ** 48 - 1 // Max uint48 (281474976710655)
        const MAX_UINT160 = BigInt(2 ** 160 - 1)
        const amountUint160 = amount > MAX_UINT160 ? MAX_UINT160 : amount

        let permit2AllowanceHash: `0x${string}` | undefined
        try {
          permit2AllowanceHash = await writeContractAsync({
            address: PERMIT2_ADDRESS,
            abi: Permit2Abi,
            functionName: 'approve',
            args: [tokens[tokenIn].address, UNISWAP_UNIVERSAL_ROUTER_ADDRESS, amountUint160, maxExpiration],
          })
        } catch (allowanceError) {
          // Preserve the original error so isUserRejectedTxError can detect it
          throw allowanceError
        }

        if (!permit2AllowanceHash) {
          // If writeContractAsync returns undefined, it's likely a user rejection
          // Create an error that matches the user rejection pattern
          const rejectionError = new Error('User rejected the request')
          ;(rejectionError as any).cause = { code: 4001 }
          throw rejectionError
        }

        setApprovalTxHash(permit2AllowanceHash)
        // Note: setApproving(false) is handled by executeTxFlow's onComplete callback
        // and by the useEffect that watches isWritePending
        return permit2AllowanceHash
      } catch (error) {
        setApproving(false)
        setApprovalTxHash(null)
        // Re-throw the error so executeTxFlow can handle it and show the user the actual error
        throw error
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
    allowance: permit2Amount,
    isCheckingAllowance: isAllowanceLoading,
    isFetchingAllowance: isAllowanceFetching,
    isApproving: isApproving || isWritePending,
    hasSufficientAllowance,
    approve,
    refetchAllowance,
    tokenAddress: tokens[tokenIn].address,
  }
}

/**
 * Hook for executing swaps using Uniswap Universal Router
 * Universal Router uses execute(commands, inputs) pattern
 * Command 0x00 = V3_SWAP_EXACT_IN
 */
export const useSwapExecution = () => {
  const { state, tokens, setSwapping, setSwapError, setSwapTxHash } = useSwappingContext()
  const { tokenIn, tokenOut, amountIn, quote, isSwapping, swapError, swapTxHash, poolFee } = state
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  /**
   * Execute swap with pre-calculated amountOutMinimum
   * @param amountOutMinimum - Minimum amount to receive (calculated by caller based on slippage)
   */
  const execute = useCallback(
    async (amountOutMinimum: bigint) => {
      if (
        !address ||
        !amountIn ||
        !quote ||
        !poolFee ||
        !tokens[tokenIn].decimals ||
        !tokens[tokenOut].address ||
        !tokens[tokenIn].address ||
        !writeContractAsync ||
        !UNISWAP_UNIVERSAL_ROUTER_ADDRESS ||
        !amountOutMinimum
      ) {
        return null
      }

      setSwapping(true)
      setSwapError(null)

      try {
        const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)

        // Import publicClient once for all operations
        const { publicClient } = await import('@/lib/viemPublicClient')

        // Verify both ERC-20 allowance (Permit2 -> token) and Permit2 allowance (user -> Universal Router)
        // With payerIsUser: true, Universal Router uses Permit2, which requires:
        // 1. ERC-20 approval: user -> Permit2 contract
        // 2. Permit2 approval: user -> Universal Router
        const { PERMIT2_ADDRESS: permit2Address } = await import('@/lib/constants')
        const { Permit2Abi } = await import('@/lib/abis/Permit2Abi')
        const { RIFTokenAbi } = await import('@/lib/abis/RIFTokenAbi')

        // Check ERC-20 allowance: user -> Permit2
        const erc20Allowance = await publicClient.readContract({
          address: tokens[tokenIn].address,
          abi: RIFTokenAbi,
          functionName: 'allowance',
          args: [address, permit2Address],
        })

        // Check Permit2 allowance: user -> Universal Router
        const permit2Allowance = await publicClient.readContract({
          address: permit2Address,
          abi: Permit2Abi,
          functionName: 'allowance',
          args: [address, tokens[tokenIn].address, UNISWAP_UNIVERSAL_ROUTER_ADDRESS],
        })
        // Permit2 returns [amount: uint160, expiration: uint48, nonce: uint48]
        // Viem may return uint48 as number or bigint depending on the value
        const [permit2Amount, permit2Expiration] = permit2Allowance as [
          bigint,
          bigint | number,
          bigint | number,
        ]
        const currentBlock = await publicClient.getBlock()
        // Convert expiration to bigint for comparison
        const expirationBigInt =
          typeof permit2Expiration === 'bigint' ? permit2Expiration : BigInt(permit2Expiration)
        const isExpired = currentBlock.timestamp > expirationBigInt

        // Check ERC-20 allowance first (Permit2 needs this to transfer tokens)
        if (erc20Allowance < amountInBigInt) {
          throw new Error(
            `Insufficient ERC-20 allowance for Permit2. Current: ${erc20Allowance.toString()}, Required: ${amountInBigInt.toString()}. Please approve Permit2 to spend your tokens.`,
          )
        }

        if (isExpired) {
          throw new Error(
            `Permit2 allowance has expired. Expiration: ${expirationBigInt.toString()}, Current block: ${currentBlock.timestamp.toString()}. Please renew your Permit2 approval.`,
          )
        }

        if (permit2Amount < amountInBigInt) {
          throw new Error(
            `Insufficient Permit2 allowance. Current: ${permit2Amount.toString()}, Required: ${amountInBigInt.toString()}. Please approve Permit2 to spend your tokens.`,
          )
        }

        // Use uniswapProvider's encoding logic with pre-calculated amountOutMinimum
        const { commands, inputs } = getSwapEncodedData({
          tokenIn: tokens[tokenIn].address,
          tokenOut: tokens[tokenOut].address,
          amountIn: amountInBigInt,
          amountOutMinimum,
          poolFee,
          recipient: address,
        })

        // Use execute WITHOUT deadline parameter as per docs
        // The docs state that execute without deadline should not fail due to timestamp
        const hash = await writeContractAsync({
          address: UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
          abi: UniswapUniversalRouterAbi,
          functionName: 'execute',
          args: [commands, inputs], // No deadline parameter
        })

        setSwapTxHash(hash)
        return hash
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorString = String(error)

        // Check for AllowanceExpired error (0xd81b2f2e) from Permit2/Universal Router
        if (errorString.includes('0xd81b2f2e') || errorMessage.includes('AllowanceExpired')) {
          const err = new Error(
            'Allowance error detected. Please go back to Step 2 and click "Request allowance" again.',
          )
          setSwapError(err)
          setSwapping(false)
          return null
        }

        const err = error instanceof Error ? error : new Error(`Failed to execute swap: ${errorMessage}`)
        setSwapError(err)
        setSwapping(false)
        return null
      }
    },
    [
      address,
      amountIn,
      quote,
      tokenIn,
      tokenOut,
      poolFee,
      tokens,
      writeContractAsync,
      setSwapping,
      setSwapError,
      setSwapTxHash,
    ],
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
