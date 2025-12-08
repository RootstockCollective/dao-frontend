import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { handleAmountInput } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SwapStepProps } from '../types'
import { useSwapInput, useTokenSelection } from '@/shared/context/SwappingContext/hooks'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { USDT0, USDRIF } from '@/lib/constants'
import Big from '@/lib/big'

export const SwapStepOne = ({ onGoNext, setButtonActions }: SwapStepProps) => {
  const { amountIn, setAmountIn, formattedAmountOut, isQuoting, isQuoteExpired } = useSwapInput()
  const { tokenInData, tokenOutData } = useTokenSelection()
  const { balances, prices } = useBalancesContext()
  const inputRef = useRef<HTMLInputElement>(null)

  // Map context values to component expectations
  const tokenToSend = {
    balance: balances[USDT0]?.balance || '0',
    symbol: tokenInData.symbol,
    price: prices[USDT0]?.price?.toString(),
    contract: tokenInData.address,
  }
  const tokenToReceive = {
    balance: balances[USDRIF]?.balance || '0',
    symbol: tokenOutData.symbol,
    price: prices[USDRIF]?.price?.toString(),
    contract: tokenOutData.address,
  }
  const amountOut = formattedAmountOut || '0'

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const isAmountOverBalance = useMemo(() => {
    if (!amountIn) return false
    return Big(amountIn).gt(tokenToSend.balance)
  }, [amountIn, tokenToSend.balance])

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
      const calculatedAmount = Big(tokenToSend.balance).mul(percentage).toString()
      setAmountIn(calculatedAmount)
    },
    [tokenToSend.balance, setAmountIn],
  )

  // Prepare tokens for SwapInputComponent
  const tokens: SwapInputToken[] = useMemo(
    () => [
      {
        symbol: tokenInData.symbol,
        address: tokenInData.address,
        name: tokenInData.name,
        decimals: tokenInData.decimals,
        price: tokenToSend.price ? parseFloat(tokenToSend.price) : undefined,
      },
    ],
    [tokenInData, tokenToSend.price],
  )

  const selectedToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenInData.symbol,
      address: tokenInData.address,
      name: tokenInData.name,
      decimals: tokenInData.decimals || 6,
      price: tokenToSend.price ? parseFloat(tokenToSend.price) : undefined,
    }),
    [tokenInData, tokenToSend.price],
  )

  // Token for output (readonly)
  const outputToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenOutData.symbol,
      address: tokenOutData.address,
      name: tokenOutData.name,
      decimals: tokenOutData.decimals || 18,
      price: tokenToReceive.price ? parseFloat(tokenToReceive.price) : undefined,
    }),
    [tokenOutData, tokenToReceive.price],
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
          balance={tokenToSend.balance}
          onPercentageClick={handlePercentageClick}
          labelText="Amount to swap"
          errorText={
            isAmountOverBalance
              ? `This is more than the available ${tokenToSend.symbol} balance. Please update the amount.`
              : ''
          }
        />

        {/* Output token (readonly) */}
        <SwapInputComponent
          tokens={[outputToken]}
          selectedToken={outputToken}
          onTokenChange={() => {}} // Token selection disabled
          amount={amountOut}
          onAmountChange={() => {}} // Readonly
          balance={tokenToReceive.balance}
          readonly
          labelText="You will receive"
        />
      </div>
    </>
  )
}
