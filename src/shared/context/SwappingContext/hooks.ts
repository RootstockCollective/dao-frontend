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
import { formatForDisplay } from '@/lib/utils'
import { UniswapUniversalRouterAbi } from '@/lib/abis/UniswapUniversalRouterAbi'

const QUOTE_DEBOUNCE_MS = 500
const QUOTE_TIMEOUT_MS = 10_000

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ])
}

/**
 * Manages bidirectional swap input with Uniswap quote fetching.
 *
 * Supports two modes:
 * - exactIn: User enters amount to swap, quote returns expected output
 * - exactOut: User enters desired output, quote returns required input
 *
 * Architecture note: Only the user-edited amount (typedAmount) is stored in state.
 * The opposite amount is computed from the quote on each render. This avoids
 * circular state updates that would cause infinite re-renders.
 *
 * @returns Display values for both fields, setters that switch mode, and quote state
 */
export const useSwapInput = () => {
  const { state, setSwapInput, tokens, setQuote, setQuoteError, setPoolFee } = useSwappingContext()
  const { mode, typedAmount, tokenIn, tokenOut, quote } = state

  // Wait for user to stop typing before fetching quote (avoids excessive API calls)
  const [debouncedTypedAmount] = useDebounce(typedAmount, QUOTE_DEBOUNCE_MS)

  // React Query handles caching, refetching, and loading states
  const {
    data: swapQuote,
    isLoading: isQuoteLoading,
    isFetching: isQuoteFetching,
    error: quoteError,
  } = useQuery({
    queryKey: ['swapQuote', tokenIn, tokenOut, mode, debouncedTypedAmount],
    queryFn: async () => {
      const tokenInDecimals = tokens[tokenIn].decimals
      const tokenOutDecimals = tokens[tokenOut].decimals
      if (!tokenInDecimals || !tokenOutDecimals || !debouncedTypedAmount) {
        return null
      }

      if (mode === 'exactOut') {
        // User specified output amount, get required input
        const amountOutBigInt = parseUnits(debouncedTypedAmount, tokenOutDecimals)
        if (amountOutBigInt <= 0n) return null

        if (!uniswapProvider.getQuoteExactOutput) {
          throw new Error('Exact output quotes not supported')
        }

        const result = await withTimeout(
          uniswapProvider.getQuoteExactOutput({
            tokenIn: tokens[tokenIn].address,
            tokenOut: tokens[tokenOut].address,
            amountOut: amountOutBigInt,
            tokenInDecimals,
            tokenOutDecimals,
          }),
          QUOTE_TIMEOUT_MS,
          'Quote request timed out.',
        )

        if (result.error) throw new Error(result.error)
        if (!result.feeTier || !result.amountInRaw) throw new Error('Invalid quote response')

        return {
          amountOut: amountOutBigInt,
          amountIn: BigInt(result.amountInRaw),
          gasEstimate: result.gasEstimate ? BigInt(result.gasEstimate) : 0n,
          feeTier: result.feeTier,
          timestamp: Date.now(),
        } as QuoteResult
      }

      // exactIn: User specified input amount, get expected output
      const amountInBigInt = parseUnits(debouncedTypedAmount, tokenInDecimals)
      if (amountInBigInt <= 0n) return null

      const result = await withTimeout(
        uniswapProvider.getQuote({
          tokenIn: tokens[tokenIn].address,
          tokenOut: tokens[tokenOut].address,
          amountIn: amountInBigInt,
          tokenInDecimals,
          tokenOutDecimals,
        }),
        QUOTE_TIMEOUT_MS,
        'Quote request timed out.',
      )

      if (result.error) throw new Error(result.error)
      if (!result.feeTier) throw new Error('Invalid quote response')

      return {
        amountOut: BigInt(result.amountOutRaw),
        gasEstimate: result.gasEstimate ? BigInt(result.gasEstimate) : 0n,
        feeTier: result.feeTier,
        timestamp: Date.now(),
      } as QuoteResult
    },
    enabled: !!debouncedTypedAmount && !!tokens[tokenIn].decimals && !!tokens[tokenOut].decimals,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  })

  // Persist successful quotes to context for use in other swap steps
  // Note: Loading state (isQuoting) comes directly from React Query, not synced to context
  useEffect(() => {
    if (quoteError) {
      setQuoteError(quoteError instanceof Error ? quoteError : new Error(String(quoteError)))
    } else if (swapQuote) {
      setQuote(swapQuote)
      setPoolFee(swapQuote.feeTier)
      setQuoteError(null)
    }
  }, [swapQuote, quoteError, setQuote, setQuoteError, setPoolFee])

  /**
   * Amount values with full precision.
   * These are the source of truth - format only at display site.
   */
  const amountIn = useMemo(() => {
    if (mode === 'exactIn') {
      return typedAmount
    }
    // exactOut: derive from quote
    if (!quote?.amountIn || !tokens[tokenIn].decimals) return ''
    return formatUnits(quote.amountIn, tokens[tokenIn].decimals)
  }, [mode, typedAmount, quote, tokens, tokenIn])

  const amountOut = useMemo(() => {
    if (mode === 'exactOut') {
      return typedAmount
    }
    // exactIn: derive from quote
    if (!quote?.amountOut || !tokens[tokenOut].decimals) return ''
    return formatUnits(quote.amountOut, tokens[tokenOut].decimals)
  }, [mode, typedAmount, quote, tokens, tokenOut])

  // Quotes become stale after 30 seconds due to price movements
  const isQuoteExpired = useMemo(() => {
    if (!quote?.timestamp) return false
    return Date.now() - quote.timestamp > 30_000
  }, [quote])

  return {
    // Full precision values - format at display site only
    amountIn,
    amountOut,
    // Editing either field switches mode and updates the stored amount
    setAmountIn: (value: string) => setSwapInput('exactIn', value),
    setAmountOut: (value: string) => setSwapInput('exactOut', value),
    mode,
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
        throw new Error('Wallet not connected. Please connect your wallet and try again.')
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

        // Check for wallet connection issues
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('getChainId is not a function') || errorMessage.includes('connector')) {
          throw new Error(
            'Wallet connection error. Please disconnect and reconnect your wallet, then try again.',
          )
        }

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
  const { tokenIn, tokenOut, mode, typedAmount, quote, isSwapping, swapError, swapTxHash, poolFee } = state
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  // Compute amountIn: for exactIn it's typedAmount, for exactOut it comes from quote
  const amountIn = useMemo(() => {
    if (mode === 'exactIn') {
      return typedAmount
    }
    // exactOut mode: amountIn comes from quote
    if (!quote?.amountIn || !tokens[tokenIn].decimals) return ''
    return formatUnits(quote.amountIn, tokens[tokenIn].decimals)
  }, [mode, typedAmount, quote, tokens, tokenIn])

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
          throw new Error(`Insufficient allowance. Please go back to Step 2 and request allowance again.`)
        }

        if (isExpired) {
          throw new Error(`Your allowance has expired. Please go back to Step 2 and request a new allowance.`)
        }

        if (permit2Amount < amountInBigInt) {
          throw new Error(`Insufficient allowance. Please go back to Step 2 and request allowance again.`)
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

        // Check for wallet connection issues
        if (errorMessage.includes('getChainId is not a function') || errorMessage.includes('connector')) {
          const err = new Error(
            'Wallet connection error. Please disconnect and reconnect your wallet, then try again.',
          )
          setSwapError(err)
          setSwapping(false)
          return null
        }

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
