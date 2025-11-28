import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { handleAmountInput } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SwapStepProps, ButtonActions } from '../types'

// TODO: Import and use useSwappingContext when SwappingProvider is merged from dao-1767
// import { useSwappingContext } from '@/shared/context/SwappingContext'

export const SwapStepOne = ({ onGoNext, setButtonActions }: SwapStepProps) => {
  // TODO: Replace with actual useSwappingContext when SwappingProvider is merged
  // const { amount, onAmountChange, tokenToSend, tokenToReceive, amountOut, setButtonActions } = useSwappingContext()

  // Temporary placeholder - remove when SwappingProvider is available
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock data - will be replaced with actual context
  const amount = ''
  const onAmountChange = (_value: string) => {}
  const tokenToSend = { balance: '0', symbol: 'USDT0', price: '1', contract: '0x0' }
  const tokenToReceive = { balance: '0', symbol: 'USDRIF', price: '1', contract: '0x0' }
  const amountOut = '0'

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const isAmountOverBalance = useMemo(() => {
    if (!amount) return false
    const rawAmount = parseFloat(amount)
    const rawBalance = parseFloat(tokenToSend.balance)
    return rawAmount > rawBalance
  }, [amount, tokenToSend.balance])

  // Set button actions
  // TODO: Re-enable validation when actual functionality is wired
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Continue',
        onClick: onGoNext,
        disabled: false, // Temporarily disabled for UI demo - will be: !amount || Number(amount) <= 0 || isAmountOverBalance
        loading: false,
      },
    })
  }, [onGoNext, setButtonActions])

  const handleAmountChange = useCallback(
    (value: string) => {
      onAmountChange(handleAmountInput(value))
    },
    [onAmountChange],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const calculatedAmount = (parseFloat(tokenToSend.balance) * percentage).toString()
      onAmountChange(calculatedAmount)
    },
    [tokenToSend.balance, onAmountChange],
  )

  // Prepare tokens for SwapInputComponent
  const tokens: SwapInputToken[] = useMemo(
    () => [
      {
        symbol: tokenToSend.symbol,
        address: tokenToSend.contract,
        name: tokenToSend.symbol,
        decimals: 6, // USDT0 typically has 6 decimals
        price: tokenToSend.price ? parseFloat(tokenToSend.price) : undefined,
      },
    ],
    [tokenToSend],
  )

  const selectedToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenToSend.symbol,
      address: tokenToSend.contract,
      name: tokenToSend.symbol,
      decimals: 6,
      price: tokenToSend.price ? parseFloat(tokenToSend.price) : undefined,
    }),
    [tokenToSend],
  )

  // Token for output (readonly)
  const outputToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenToReceive.symbol,
      address: tokenToReceive.contract,
      name: tokenToReceive.symbol,
      decimals: 18, // USDRIF typically has 18 decimals
      price: tokenToReceive.price ? parseFloat(tokenToReceive.price) : undefined,
    }),
    [tokenToReceive],
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
          amount={amount}
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
