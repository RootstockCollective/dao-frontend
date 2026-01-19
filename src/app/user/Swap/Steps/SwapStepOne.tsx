import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { handleAmountInput, formatForDisplay } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SwapStepProps } from '../types'
import { useSwapInput, useTokenSelection } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { USDT0, USDRIF } from '@/lib/constants'
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
  const inputRef = useRef<HTMLInputElement>(null)
  // Track which field the user is actively typing in (prevents loop from programmatic value updates)
  const activeFieldRef = useRef<'in' | 'out' | null>(null)

  // Get balances and prices from context
  const tokenInBalance = tokenData.balances[USDT0]
  const tokenOutBalance = tokenData.balances[USDRIF]
  const tokenInPrice = tokenData.prices[USDT0]
  const tokenOutPrice = tokenData.prices[USDRIF]

  // Display values: typed field shows raw, derived field shows formatted (2 decimals)
  const displayAmountIn = useMemo(() => {
    if (mode === 'exactIn') return amountIn // User is typing, show raw
    return formatForDisplay(amountIn) // Derived from quote, format it
  }, [mode, amountIn])

  const displayAmountOut = useMemo(() => {
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

  // Set button actions
  useEffect(() => {
    const hasValidAmount = amountIn && Big(amountIn).gt(0)
    const hasQuote = !!quote && amountOut && Big(amountOut).gt(0)
    // Disable if quote is expired, still loading, or invalid
    const isDisabled = !hasValidAmount || isAmountOverBalance || isQuoting || !hasQuote || isQuoteExpired

    setButtonActions({
      primary: {
        label: 'Continue',
        onClick: onGoNext,
        disabled: isDisabled,
        loading: isQuoting,
      },
    })
  }, [amountIn, isAmountOverBalance, amountOut, isQuoting, isQuoteExpired, onGoNext, setButtonActions, quote])

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
          isLoading={isQuoting}
          errorText={quoteError ? 'Failed to get quote. Pool may have insufficient liquidity.' : ''}
          autoFocus={false}
        />
      </div>
    </>
  )
}
