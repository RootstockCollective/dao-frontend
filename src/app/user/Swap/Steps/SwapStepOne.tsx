import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { handleAmountInput, formatForDisplay } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SwapStepProps } from '../types'
import { useSwapInput, useTokenSelection } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { USDT0, USDRIF } from '@/lib/constants'
import Big from '@/lib/big'

export const SwapStepOne = ({ onGoNext, setButtonActions }: SwapStepProps) => {
  const { amountIn, setAmountIn, formattedAmountOut, isQuoting, isQuoteExpired, quoteError } = useSwapInput()
  const { tokenInData, tokenOutData } = useTokenSelection()
  const { tokenData } = useSwappingContext()
  const inputRef = useRef<HTMLInputElement>(null)

  // Get balances and prices from context
  const tokenInBalance = tokenData.balances[USDT0]
  const tokenOutBalance = tokenData.balances[USDRIF]
  const tokenInPrice = tokenData.prices[USDT0]
  const tokenOutPrice = tokenData.prices[USDRIF]

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const isAmountOverBalance = useMemo(() => {
    if (!amountIn) return false
    return Big(amountIn).gt(tokenInBalance)
  }, [amountIn, tokenInBalance])

  // Set button actions
  useEffect(() => {
    const hasValidAmount = amountIn && Big(amountIn).gt(0)
    const hasQuote = formattedAmountOut && Big(formattedAmountOut).gt(0)
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
  }, [
    amountIn,
    isAmountOverBalance,
    formattedAmountOut,
    isQuoting,
    isQuoteExpired,
    onGoNext,
    setButtonActions,
  ])

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmountIn(handleAmountInput(value))
    },
    [setAmountIn],
  )

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
        {/* Input token (editable) */}
        <SwapInputComponent
          ref={inputRef}
          tokens={tokens}
          selectedToken={selectedToken}
          onTokenChange={() => {}} // Token selection disabled for swap
          amount={amountIn}
          onAmountChange={handleAmountChange}
          balance={formatForDisplay(tokenInBalance)}
          onPercentageClick={handlePercentageClick}
          labelText="Amount to swap"
          errorText={
            isAmountOverBalance
              ? `This is more than the available ${tokenInData.symbol} balance. Please update the amount.`
              : ''
          }
        />

        {/* Output token (readonly) */}
        <SwapInputComponent
          tokens={[outputToken]}
          selectedToken={outputToken}
          onTokenChange={() => {}} // Token selection disabled
          amount={formatForDisplay(formattedAmountOut || '0')}
          onAmountChange={() => {}} // Readonly
          balance={formatForDisplay(tokenOutBalance)}
          readonly
          labelText="You will receive"
          isLoading={isQuoting}
          errorText={quoteError ? 'Failed to get quote. Pool may have insufficient liquidity.' : ''}
        />
      </div>
    </>
  )
}
