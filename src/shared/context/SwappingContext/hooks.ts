'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
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
      setQuoting(true)
      setQuoteError(null)
    } else if (quoteErrorData) {
      const err = quoteErrorData instanceof Error ? quoteErrorData : new Error('Failed to get quote')
      setQuoteError(err)
      setQuoting(false)
    } else if (swapQuote) {
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

  // Read Permit2 allowance (Universal Router uses Permit2 when payerIsUser: true)
  const {
    data: permit2AllowanceData,
    isLoading: isAllowanceLoading,
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

  // Update state when allowance changes
  // Permit2 returns (amount, expiration, nonce), we only need amount
  useEffect(() => {
    if (isAllowanceLoading) {
      setCheckingAllowance(true)
    } else if (permit2AllowanceData !== undefined) {
      // Permit2 allowance returns [amount, expiration, nonce]
      const amount = Array.isArray(permit2AllowanceData) ? permit2AllowanceData[0] : permit2AllowanceData
      setAllowance(typeof amount === 'bigint' ? amount : null)
    }
  }, [permit2AllowanceData, isAllowanceLoading, setCheckingAllowance, setAllowance])

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
        throw new Error('Missing required parameters for approval')
      }

      if (!tokens[tokenIn]?.address) {
        throw new Error(`Token address not found for ${tokenIn}`)
      }

      setApproving(true)
      setApprovalTxHash(null)

      try {
        const { publicClient } = await import('@/lib/viemPublicClient')

        // Step 1: Approve Permit2 to spend tokens (ERC-20 approval)
        let permit2ApprovalHash: `0x${string}` | undefined
        try {
          permit2ApprovalHash = await writeContractAsync({
            address: tokens[tokenIn].address,
            abi: RIFTokenAbi,
            functionName: 'approve',
            args: [PERMIT2_ADDRESS, amount],
          })
        } catch (approvalError) {
          // Preserve the original error so isUserRejectedTxError can detect it
          throw approvalError
        }

        if (!permit2ApprovalHash) {
          // If writeContractAsync returns undefined, it's likely a user rejection
          // Create an error that matches the user rejection pattern
          const rejectionError = new Error('User rejected the request')
          ;(rejectionError as any).cause = { code: 4001 }
          throw rejectionError
        }

        // Wait for first transaction to be confirmed before proceeding
        await publicClient.waitForTransactionReceipt({
          hash: permit2ApprovalHash,
        })

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
    allowance,
    isCheckingAllowance: isCheckingAllowance || isAllowanceLoading,
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
