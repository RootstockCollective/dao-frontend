'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits, Hex } from 'viem'
import { useAccount, useReadContract, useWriteContract, useSignTypedData } from 'wagmi'
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
import { createSecurePermit } from '@/lib/swap/permit2'

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
 * Hook for checking and managing ERC-20 allowance to Permit2 contract
 *
 * With the new Permit2 signature flow:
 * - We only need ERC-20 → Permit2 approval (one-time per token)
 * - Permit2 → Universal Router is handled via signatures at swap time
 */
export const useTokenAllowance = () => {
  const { state, tokens, setApproving, setApprovalTxHash, setCheckingAllowance, setAllowance } =
    useSwappingContext()
  const { tokenIn, isApproving, allowance } = state
  const { address } = useAccount()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  // Read ERC-20 allowance to Permit2 contract
  const {
    data: erc20AllowanceData,
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

  // Extract ERC-20 allowance
  const erc20Allowance = useMemo(() => {
    if (typeof erc20AllowanceData !== 'bigint') return null
    return erc20AllowanceData
  }, [erc20AllowanceData])

  // Update state when allowance changes
  useEffect(() => {
    if (isAllowanceLoading) {
      setCheckingAllowance(true)
    } else {
      setCheckingAllowance(false)
      if (erc20Allowance !== null) {
        setAllowance(erc20Allowance)
      }
    }
  }, [erc20Allowance, isAllowanceLoading, setCheckingAllowance, setAllowance])

  // Check if ERC-20 allowance to Permit2 is sufficient
  const hasSufficientAllowance = useCallback(
    (requiredAmount: bigint) => {
      if (allowance === null) {
        return false
      }
      return allowance >= requiredAmount
    },
    [allowance],
  )

  // Approve ERC-20 token for Permit2 contract
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
        // Request ERC-20 approval to Permit2
        // Use max uint256 for unlimited approval (common pattern for Permit2)
        const MAX_UINT256 = BigInt(2) ** BigInt(256) - BigInt(1)
        const approvalAmount = amount > MAX_UINT256 ? MAX_UINT256 : MAX_UINT256 // Always use max for convenience

        const txHash = await writeContractAsync({
          address: tokens[tokenIn].address,
          abi: RIFTokenAbi,
          functionName: 'approve',
          args: [PERMIT2_ADDRESS, approvalAmount],
        })

        if (!txHash) {
          const rejectionError = new Error('User rejected the request')
          ;(rejectionError as any).cause = { code: 4001 }
          throw rejectionError
        }

        setApprovalTxHash(txHash)
        return txHash
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
    allowance,
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
 * Hook for signing Permit2 spending cap
 *
 * This creates and signs a Permit2 permit message (off-chain, no gas).
 * The signature is stored in state to be used by useSwapExecution.
 */
export const usePermitSigning = () => {
  const { state, tokens, setPermit, setPermitSignature, setSigning } = useSwappingContext()
  const { tokenIn, mode, typedAmount, quote, isSigning, permit, permitSignature } = state
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

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

    setSigning(true)

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
      setPermit(newPermit)
      setPermitSignature(signature as Hex)

      return { signature: signature as Hex, permit: newPermit }
    } catch (error) {
      setSigning(false)
      throw error
    }
  }, [
    address,
    amountIn,
    tokenIn,
    tokens,
    chainId,
    signTypedDataAsync,
    setSigning,
    setPermit,
    setPermitSignature,
  ])

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
   * Execute swap using Permit2 allowance (set in Step 2)
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

        const hash = await writeContractAsync({
          address: UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
          abi: UniswapUniversalRouterAbi,
          functionName: 'execute',
          args: [commands, inputs],
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

        // User rejected transaction
        if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
          setSwapError(new Error('Transaction cancelled by user'))
        } else {
          setSwapError(error instanceof Error ? error : new Error(`Swap failed: ${errorMessage}`))
        }
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
