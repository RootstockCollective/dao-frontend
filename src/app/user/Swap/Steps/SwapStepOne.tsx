import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { handleAmountInput, formatForDisplay } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SwapStepProps } from '../types'
import { useSwapInput, useTokenSelection, useTokenAllowance } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { executeTxFlow } from '@/shared/notification'
import { USDT0, USDRIF } from '@/lib/constants'
import { parseUnits, Hash } from 'viem'
import Big from '@/lib/big'

export const SwapStepOne = ({ onGoNext, setButtonActions }: SwapStepProps) => {
  const {
    amountIn,
    amountOut,
    setAmountIn,
    setAmountOut,
    isQuoting,
    isQuoteExpired,
    quoteError,
    quote,
    mode,
  } = useSwapInput()
  const { tokenInData, tokenOutData } = useTokenSelection()
  const { tokenData } = useSwappingContext()
  const { allowance, isApproving, hasSufficientAllowance, approve, refetchAllowance, isCheckingAllowance } =
    useTokenAllowance()
  const inputRef = useRef<HTMLInputElement>(null)
  // Track which field the user is actively typing in (prevents loop from programmatic value updates)
  const activeFieldRef = useRef<'in' | 'out' | null>(null)

  // Get balances and prices from context
  const tokenInBalance = tokenData.balances[USDT0]
  const tokenOutBalance = tokenData.balances[USDRIF]
  const tokenInPrice = tokenData.prices[USDT0]
  const tokenOutPrice = tokenData.prices[USDRIF]

  // Display values: typed field shows raw, derived field shows formatted (2 decimals)
  // When empty, return '' so the placeholder "0" shows
  const displayAmountIn = useMemo(() => {
    if (!amountIn) return ''
    if (mode === 'exactIn') return amountIn // User is typing, show raw
    return formatForDisplay(amountIn) // Derived from quote, format it
  }, [mode, amountIn])

  const displayAmountOut = useMemo(() => {
    if (!amountOut) return ''
    if (mode === 'exactOut') return amountOut // User is typing, show raw
    return formatForDisplay(amountOut) // Derived from quote, format it
  }, [mode, amountOut])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      activeFieldRef.current = 'in' // Set active field on initial focus
    }
  }, [])

  const isAmountOverBalance = useMemo(() => {
    if (!amountIn) return false
    return Big(amountIn).gt(tokenInBalance)
  }, [amountIn, tokenInBalance])

  // Calculate required amount
  const requiredAmount = useMemo(() => {
    if (!amountIn || !tokenInData.decimals) return 0n
    try {
      return parseUnits(amountIn, tokenInData.decimals)
    } catch {
      return 0n
    }
  }, [amountIn, tokenInData.decimals])

  // Check if ERC-20 allowance is sufficient
  const isAllowanceEnough = useMemo(() => {
    if (allowance === null || requiredAmount === 0n) return false
    return hasSufficientAllowance(requiredAmount)
  }, [allowance, requiredAmount, hasSufficientAllowance])

  // Handle Continue click - approve if needed, then advance
  const handleContinue = useCallback(() => {
    if (isAllowanceEnough) {
      // ERC-20 already approved, just advance
      onGoNext()
    } else {
      // Need ERC-20 approval
      executeTxFlow({
        onRequestTx: async () => {
          const txHash = await approve(requiredAmount)
          if (!txHash) {
            throw new Error('Transaction hash is null')
          }
          return txHash as Hash
        },
        onSuccess: async () => {
          // Verify allowance after approval
          const { data: newAllowance } = await refetchAllowance()
          if (typeof newAllowance !== 'bigint' || newAllowance < requiredAmount) {
            throw new Error('Allowance verification failed')
          }
          onGoNext()
        },
        action: 'allowance',
      })
    }
  }, [isAllowanceEnough, requiredAmount, approve, refetchAllowance, onGoNext])

  // Set button actions
  useEffect(() => {
    const hasValidAmount = amountIn && Big(amountIn).gt(0)
    const hasQuote = !!quote && amountOut && Big(amountOut).gt(0)
    // Disable if quote is expired, still loading, checking allowance, or invalid
    const isDisabled =
      !hasValidAmount ||
      isAmountOverBalance ||
      isQuoting ||
      !hasQuote ||
      isQuoteExpired ||
      isApproving ||
      isCheckingAllowance

    // Show "Continue" as default when:
    // - No valid amount entered yet (we can't determine if approval is needed)
    // - Still checking allowance
    // - Allowance is sufficient
    // Show "Approve & Continue" only when we have a valid amount AND we're sure allowance is insufficient
    const needsApproval = hasValidAmount && !isCheckingAllowance && !isAllowanceEnough
    const buttonLabel = needsApproval ? 'Approve & Continue' : 'Continue'

    setButtonActions({
      primary: {
        label: buttonLabel,
        onClick: handleContinue,
        disabled: isDisabled,
        loading: isQuoting || isApproving || isCheckingAllowance,
        isTxPending: isApproving,
      },
    })
  }, [
    amountIn,
    isAmountOverBalance,
    amountOut,
    isQuoting,
    isQuoteExpired,
    isApproving,
    isCheckingAllowance,
    isAllowanceEnough,
    handleContinue,
    setButtonActions,
    quote,
  ])

  const handleAmountChange = useCallback(
    (value: string) => {
      // Only process if user is actively typing in this field
      // Ignore programmatic changes from NumericFormat when quote updates the value prop
      if (activeFieldRef.current !== 'in') return
      setAmountIn(handleAmountInput(value))
    },
    [setAmountIn],
  )

  const handleAmountOutChange = useCallback(
    (value: string) => {
      // Only process if user is actively typing in this field
      if (activeFieldRef.current !== 'out') return
      setAmountOut(handleAmountInput(value))
    },
    [setAmountOut],
  )

  // Track which field user is editing to prevent quote updates from triggering handlers
  const handleInputFocus = useCallback(() => {
    activeFieldRef.current = 'in'
  }, [])

  const handleOutputFocus = useCallback(() => {
    activeFieldRef.current = 'out'
  }, [])

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const calculatedAmount = Big(tokenInBalance).mul(percentage).toString()
      setAmountIn(calculatedAmount)
    },
    [tokenInBalance, setAmountIn],
  )

  // Prepare tokens for SwapInputComponent
  const tokens: SwapInputToken[] = useMemo(
    () => [
      {
        symbol: tokenInData.symbol,
        address: tokenInData.address,
        name: tokenInData.name,
        decimals: tokenInData.decimals,
        price: tokenInPrice || undefined,
      },
    ],
    [tokenInData, tokenInPrice],
  )

  const selectedToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenInData.symbol,
      address: tokenInData.address,
      name: tokenInData.name,
      decimals: tokenInData.decimals || 6,
      price: tokenInPrice || undefined,
    }),
    [tokenInData, tokenInPrice],
  )

  // Token for output (readonly)
  const outputToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenOutData.symbol,
      address: tokenOutData.address,
      name: tokenOutData.name,
      decimals: tokenOutData.decimals || 18,
      price: tokenOutPrice || undefined,
    }),
    [tokenOutData, tokenOutPrice],
  )

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* "Amount to swap" - user can type here to specify exact input */}
        <SwapInputComponent
          ref={inputRef}
          tokens={tokens}
          selectedToken={selectedToken}
          onTokenChange={() => {}}
          amount={displayAmountIn}
          onAmountChange={handleAmountChange}
          onFocus={handleInputFocus}
          balance={formatForDisplay(tokenInBalance)}
          onPercentageClick={handlePercentageClick}
          labelText="Amount to swap"
          isLoading={isQuoting && mode === 'exactOut'}
          errorText={
            isAmountOverBalance
              ? `This is more than the available ${tokenInData.symbol} balance. Please update the amount.`
              : ''
          }
        />

        {/* "You will receive" - user can also type here to specify exact output */}
        <SwapInputComponent
          tokens={[outputToken]}
          selectedToken={outputToken}
          onTokenChange={() => {}}
          amount={displayAmountOut}
          onAmountChange={handleAmountOutChange}
          onFocus={handleOutputFocus}
          balance={formatForDisplay(tokenOutBalance)}
          labelText="You will receive"
          isLoading={isQuoting && mode === 'exactIn'}
          errorText={quoteError ? 'Failed to get quote. Pool may have insufficient liquidity.' : ''}
          autoFocus={false}
        />
      </div>
    </>
  )
}
