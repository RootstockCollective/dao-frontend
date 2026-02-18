'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits, Hex } from 'viem'
import { useAccount, useReadContract, useWriteContract, useSignTypedData } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useShallow } from 'zustand/shallow'
import { useSwapStore } from './useSwapStore'
import { useSwapTokens } from './useSwapTokens'
import { UNISWAP_UNIVERSAL_ROUTER_ADDRESS, PERMIT2_ADDRESS } from '@/lib/constants'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { Permit2Abi } from '@/lib/abis/Permit2Abi'
import { uniswapProvider, getPermitSwapEncodedData } from '@/lib/swap/providers/uniswap'
import { UniswapUniversalRouterAbi } from '@/lib/abis/UniswapUniversalRouterAbi'
import { createSecurePermit } from '@/lib/swap/permit2'
import { sentryClient } from '@/lib/sentry/sentry-client'
import type { QuoteResult } from './types'

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
  const { tokens } = useSwapTokens()
  const { mode, typedAmount, tokenIn, tokenOut, setSwapInput, setPoolFee } = useSwapStore(
    useShallow(state => ({
      mode: state.mode,
      typedAmount: state.typedAmount,
      tokenIn: state.tokenIn,
      tokenOut: state.tokenOut,
      setSwapInput: state.setSwapInput,
      setPoolFee: state.setPoolFee,
    })),
  )

  // Wait for user to stop typing before fetching quote (avoids excessive API calls)
  const [debouncedTypedAmount] = useDebounce(typedAmount, QUOTE_DEBOUNCE_MS)

  // React Query handles caching, refetching, and loading states
  const {
    data: quote,
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

  // Update pool fee in store when quote arrives
  useEffect(() => {
    if (quote?.feeTier) {
      setPoolFee(quote.feeTier)
    }
  }, [quote?.feeTier, setPoolFee])

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
  const { tokens } = useSwapTokens()
  const { tokenIn, tokenOut, setTokenIn, setTokenOut, toggleTokens } = useSwapStore(
    useShallow(state => ({
      tokenIn: state.tokenIn,
      tokenOut: state.tokenOut,
      setTokenIn: state.setTokenIn,
      setTokenOut: state.setTokenOut,
      toggleTokens: state.toggleTokens,
    })),
  )

  return {
    tokenIn,
    tokenOut,
    tokenInData: tokens[tokenIn],
    tokenOutData: tokens[tokenOut],
    setTokenIn,
    setTokenOut,
    toggleTokenSelection: toggleTokens,
  }
}

/**
 * Hook for checking and managing ERC-20 allowance to Permit2 contract
 *
 * With the new Permit2 signature flow:
 * - We only need ERC-20 → Permit2 approval (one-time per token)
 * - Permit2 → Universal Router is handled via signatures at swap time
 */
export const useTokenAllowance = () => {
  const { tokens } = useSwapTokens()
  const { tokenIn, setApprovalTxHash } = useSwapStore(
    useShallow(state => ({
      tokenIn: state.tokenIn,
      setApprovalTxHash: state.setApprovalTxHash,
    })),
  )
  const { address } = useAccount()
  const { writeContractAsync, isPending: isApproving } = useWriteContract()

  // Read ERC-20 allowance to Permit2 contract
  const {
    data: allowance,
    isLoading: isAllowanceLoading,
    isFetching: isAllowanceFetching,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokens[tokenIn]?.address,
    abi: RIFTokenAbi,
    functionName: 'allowance',
    args: address && PERMIT2_ADDRESS ? [address, PERMIT2_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!tokens[tokenIn]?.address && !!PERMIT2_ADDRESS,
      refetchInterval: 5000,
    },
  })

  // Check if ERC-20 allowance to Permit2 is sufficient
  const hasSufficientAllowance = useCallback(
    (requiredAmount: bigint) => {
      if (typeof allowance !== 'bigint') {
        return false
      }
      return allowance >= requiredAmount
    },
    [allowance],
  )

  // Approve ERC-20 token for Permit2 contract
  const approve = useCallback(
    async (_amount: bigint) => {
      if (!address || !writeContractAsync || !UNISWAP_UNIVERSAL_ROUTER_ADDRESS) {
        throw new Error('Wallet not connected. Please connect your wallet and try again.')
      }

      if (!tokens[tokenIn]?.address) {
        throw new Error(`Token address not found for ${tokenIn}`)
      }

      try {
        // Request ERC-20 approval to Permit2
        // Use max uint256 for unlimited approval (common pattern for Permit2)
        const MAX_UINT256 = BigInt(2) ** BigInt(256) - BigInt(1)

        const txHash = await writeContractAsync({
          address: tokens[tokenIn].address,
          abi: RIFTokenAbi,
          functionName: 'approve',
          args: [PERMIT2_ADDRESS, MAX_UINT256],
        })

        if (!txHash) {
          const rejectionError = new Error('User rejected the request')
          ;(rejectionError as any).cause = { code: 4001 }
          throw rejectionError
        }

        setApprovalTxHash(txHash)
        return txHash
      } catch (error) {
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
    [address, writeContractAsync, tokenIn, tokens, setApprovalTxHash],
  )

  return {
    allowance: typeof allowance === 'bigint' ? allowance : null,
    isCheckingAllowance: isAllowanceLoading,
    isFetchingAllowance: isAllowanceFetching,
    isApproving,
    hasSufficientAllowance,
    approve,
    refetchAllowance,
    tokenAddress: tokens[tokenIn]?.address,
  }
}

/**
 * Hook for signing Permit2 spending cap
 *
 * This creates and signs a Permit2 permit message (off-chain, no gas).
 * The signature is stored in state to be used by useSwapExecution.
 */
export const usePermitSigning = () => {
  const { tokens } = useSwapTokens()
  const { tokenIn, mode, typedAmount, permit, permitSignature, setPermitData, clearPermitData } =
    useSwapStore(
      useShallow(state => ({
        tokenIn: state.tokenIn,
        mode: state.mode,
        typedAmount: state.typedAmount,
        permit: state.permit,
        permitSignature: state.permitSignature,
        setPermitData: state.setPermitData,
        clearPermitData: state.clearPermitData,
      })),
    )
  const { address, chainId } = useAccount()
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData()

  // Get quote for exactOut mode
  const { quote } = useSwapInput()

  // Compute amountIn from mode and typedAmount/quote
  const amountIn = useMemo(() => {
    if (mode === 'exactIn') {
      return typedAmount
    }
    // exactOut: derive from quote
    if (!quote?.amountIn || !tokens[tokenIn].decimals) return ''
    return formatUnits(quote.amountIn, tokens[tokenIn].decimals)
  }, [mode, typedAmount, quote, tokens, tokenIn])

  const signPermit = useCallback(async () => {
    if (
      !address ||
      !amountIn ||
      !tokens[tokenIn].decimals ||
      !tokens[tokenIn].address ||
      !signTypedDataAsync ||
      !chainId
    ) {
      throw new Error('Missing required parameters for permit signing')
    }

    try {
      const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)

      const { publicClient } = await import('@/lib/viemPublicClient')

      // Get current nonce from Permit2
      const permit2Allowance = await publicClient.readContract({
        address: PERMIT2_ADDRESS,
        abi: Permit2Abi,
        functionName: 'allowance',
        args: [address, tokens[tokenIn].address, UNISWAP_UNIVERSAL_ROUTER_ADDRESS],
      })
      const nonce = BigInt(permit2Allowance[2])

      // Create permit using createSecurePermit
      const { permit: newPermit, typedData } = createSecurePermit({
        token: tokens[tokenIn].address,
        amount: amountInBigInt,
        spender: UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
        nonce,
        permit2Address: PERMIT2_ADDRESS,
        chainId,
        trustedSpenders: [UNISWAP_UNIVERSAL_ROUTER_ADDRESS],
      })

      // Sign the permit (wallet popup, no gas)
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      })

      // Store both permit and signature in state
      setPermitData(newPermit, signature as Hex)

      return { signature: signature as Hex, permit: newPermit }
    } catch (error) {
      clearPermitData()
      throw error
    }
  }, [address, amountIn, tokenIn, tokens, chainId, signTypedDataAsync, setPermitData, clearPermitData])

  return {
    signPermit,
    isSigning,
    permit,
    permitSignature,
  }
}

/**
 * Hook for executing swaps using Uniswap Universal Router
 *
 * Uses the permit signature from usePermitSigning (stored in state).
 * Only executes the swap transaction (1 confirmation).
 */
export const useSwapExecution = () => {
  const { tokens } = useSwapTokens()
  const {
    tokenIn,
    tokenOut,
    mode,
    typedAmount,
    poolFee,
    permit,
    permitSignature,
    isSwapping,
    swapError,
    swapTxHash,
    startSwap,
    completeSwap,
    failSwap,
  } = useSwapStore(
    useShallow(state => ({
      tokenIn: state.tokenIn,
      tokenOut: state.tokenOut,
      mode: state.mode,
      typedAmount: state.typedAmount,
      poolFee: state.poolFee,
      permit: state.permit,
      permitSignature: state.permitSignature,
      isSwapping: state.isSwapping,
      swapError: state.swapError,
      swapTxHash: state.swapTxHash,
      startSwap: state.startSwap,
      completeSwap: state.completeSwap,
      failSwap: state.failSwap,
    })),
  )
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  // Get quote for calculations
  const { quote } = useSwapInput()

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
   * Execute swap using permit signature from Step 2
   * Bundles PERMIT2_PERMIT + V3_SWAP_EXACT_IN in a single transaction
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
        !amountOutMinimum ||
        !permit ||
        !permitSignature
      ) {
        return null
      }

      startSwap()

      try {
        const amountInBigInt = parseUnits(amountIn, tokens[tokenIn].decimals)

        // Bundle permit signature + swap in a single transaction
        // The permit is executed first (granting Universal Router allowance), then the swap
        const { commands, inputs } = getPermitSwapEncodedData({
          tokenIn: tokens[tokenIn].address,
          tokenOut: tokens[tokenOut].address,
          amountIn: amountInBigInt,
          amountOutMinimum,
          poolFee,
          recipient: address,
          permit,
          signature: permitSignature,
        })

        const hash = await writeContractAsync({
          address: UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
          abi: UniswapUniversalRouterAbi,
          functionName: 'execute',
          args: [commands, inputs],
        })

        completeSwap(hash)
        return hash
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorString = String(error)

        // Check for wallet connection issues
        if (errorMessage.includes('getChainId is not a function') || errorMessage.includes('connector')) {
          const walletError = new Error(
            'Wallet connection error. Please disconnect and reconnect your wallet, then try again.',
          )
          sentryClient.captureException(walletError, {
            tags: {
              errorType: 'SWAP_WALLET_CONNECTION_ERROR',
            },
          })
          failSwap(walletError)
          return null
        }

        // Check for AllowanceExpired error (0xd81b2f2e) from Permit2/Universal Router
        if (errorString.includes('0xd81b2f2e') || errorMessage.includes('AllowanceExpired')) {
          const allowanceError = new Error(
            'Allowance error detected. Please go back to Step 2 and click "Request allowance" again.',
          )
          sentryClient.captureException(allowanceError, {
            tags: {
              errorType: 'SWAP_ALLOWANCE_ERROR',
            },
          })
          failSwap(allowanceError)
          return null
        }

        // User rejected transaction
        if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
          failSwap(new Error('Transaction cancelled by user'))
        } else {
          const swapError = error instanceof Error ? error : new Error(`Swap failed: ${errorMessage}`)
          sentryClient.captureException(swapError, {
            tags: {
              errorType: 'SWAP_EXECUTION_ERROR',
            },
            extra: {
              tokenIn,
              tokenOut,
              amountIn,
            },
          })
          failSwap(swapError)
        }
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
      permit,
      permitSignature,
      writeContractAsync,
      startSwap,
      completeSwap,
      failSwap,
    ],
  )

  return {
    execute,
    isSwapping: isSwapping || isWritePending,
    swapError,
    swapTxHash,
    canExecute: !!address && !!amountIn && !!quote && !!poolFee && !!permit && !!permitSignature,
  }
}
