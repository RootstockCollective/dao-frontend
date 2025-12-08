import { executeTxFlow } from '@/shared/notification'
import { useEffect, useCallback, useMemo } from 'react'
import { SwapStepProps } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { useSwapInput, useTokenSelection, useSwapExecution } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { USDT0, USDRIF } from '@/lib/constants'
import { Hash } from 'viem'
import Big from '@/lib/big'
import { Button } from '@/components/Button'
import { Span, Label } from '@/components/Typography'

// Slippage tolerance options (in percentage)
const SLIPPAGE_OPTIONS = [
  { value: 0.1, label: '0.1%', testId: 'slippage-0.1' },
  { value: 0.5, label: '0.5%', testId: 'slippage-0.5' },
  { value: 1.0, label: '1%', testId: 'slippage-1.0' },
  { value: 3.0, label: '3%', testId: 'slippage-3.0' },
] as const

export const SwapStepThree = ({ onGoToStep, onCloseModal, setButtonActions }: SwapStepProps) => {
  const { amountIn, formattedAmountOut } = useSwapInput()
  const { tokenInData, tokenOutData } = useTokenSelection()
  const { state, setSlippageTolerance } = useSwappingContext()
  const { balances, prices } = useBalancesContext()
  const { execute, isSwapping, swapError, swapTxHash, canExecute } = useSwapExecution()
  const { slippageTolerance } = state

  const from = useMemo(() => {
    const priceValue = prices[USDT0]?.price || 0
    const amountInCurrency = Big(amountIn).times(priceValue).toFixed(2)
    return {
      amount: amountIn,
      amountConvertedToCurrency: `$${amountInCurrency}`,
      balance: balances[USDT0]?.balance || '0',
      tokenSymbol: tokenInData.symbol,
    }
  }, [amountIn, prices, balances, tokenInData.symbol])

  const to = useMemo(() => {
    const amountValue = formattedAmountOut || '0'
    const priceValue = prices[USDRIF]?.price || 0
    const amountInCurrency = Big(amountValue).times(priceValue).toFixed(2)
    return {
      amount: amountValue,
      amountConvertedToCurrency: `$${amountInCurrency}`,
      balance: balances[USDRIF]?.balance || '0',
      tokenSymbol: tokenOutData.symbol,
    }
  }, [formattedAmountOut, prices, balances, tokenOutData.symbol])

  const handleSlippageClick = useCallback(
    (slippage: number) => {
      setSlippageTolerance(slippage)
    },
    [setSlippageTolerance],
  )

  const handleConfirmSwap = useCallback(() => {
    if (!canExecute || slippageTolerance === null) {
      return
    }
    executeTxFlow({
      onRequestTx: async () => {
        const txHash = await execute()
        if (!txHash) {
          throw new Error('Transaction hash is null')
        }
        return txHash as Hash
      },
      onSuccess: onCloseModal,
      action: 'swap',
    })
  }, [canExecute, slippageTolerance, execute, onCloseModal])

  // Set button actions
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Confirm swap',
        onClick: handleConfirmSwap,
        disabled: !canExecute || !Big(amountIn).gt(0) || slippageTolerance === null,
        loading: isSwapping,
        isTxPending: isSwapping,
      },
      secondary: {
        label: 'Back',
        onClick: () => onGoToStep(0), // Go back to Step One
        disabled: false,
        loading: false,
      },
    })
  }, [canExecute, amountIn, isSwapping, slippageTolerance, handleConfirmSwap, onGoToStep, setButtonActions])

  // At step 3, amountIn should always exist (user came from steps 1 and 2)
  if (!amountIn) {
    // This shouldn't happen, but handle gracefully
    return null
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <StakeTokenAmountDisplay
          label="From"
          amount={from.amount}
          tokenSymbol={from.tokenSymbol}
          amountInCurrency={from.amountConvertedToCurrency}
          balance={from.balance}
        />
        <StakeTokenAmountDisplay
          label="To"
          amount={to.amount}
          tokenSymbol={to.tokenSymbol}
          amountInCurrency={to.amountConvertedToCurrency}
          balance={to.balance}
          isFlexEnd
        />
      </div>

      {/* Slippage Tolerance Selection */}
      <div className="flex flex-col gap-2 mb-6">
        <Label variant="body-s" className="text-text-60">
          Slippage tolerance
        </Label>
        <div className="flex gap-1" data-testid="slippage-buttons">
          {SLIPPAGE_OPTIONS.map(({ value, label, testId }) => (
            <Button
              key={value}
              variant={slippageTolerance === value ? 'primary' : 'secondary'}
              onClick={() => handleSlippageClick(value)}
              className={
                slippageTolerance === value ? 'px-2 py-0' : 'bg-transparent border border-bg-40 px-2 py-0'
              }
              data-testid={testId}
            >
              <Span variant="body-s">{label}</Span>
            </Button>
          ))}
        </div>
      </div>

      <TransactionStatus
        txHash={swapTxHash || state.swapTxHash || undefined}
        isTxFailed={!!swapError || !!state.swapError}
        failureMessage="Swap TX failed."
      />
    </>
  )
}
