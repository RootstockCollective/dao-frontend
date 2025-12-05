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

export const SwapStepThree = ({ onGoToStep, onCloseModal, setButtonActions }: SwapStepProps) => {
  const { amountIn, formattedAmountOut } = useSwapInput()
  const { tokenInData, tokenOutData } = useTokenSelection()
  const { state } = useSwappingContext()
  const { balances, prices } = useBalancesContext()
  const { execute, isSwapping, swapError, swapTxHash, canExecute } = useSwapExecution()

  // At step 3, amountIn should always exist (user came from steps 1 and 2)
  if (!amountIn) {
    // This shouldn't happen, but handle gracefully
    return null
  }

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

  const handleConfirmSwap = useCallback(() => {
    if (!canExecute) {
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
  }, [canExecute, execute, onCloseModal])

  // Set button actions
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Confirm swap',
        onClick: handleConfirmSwap,
        disabled: !canExecute || !Big(amountIn).gt(0),
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
  }, [canExecute, amountIn, isSwapping, handleConfirmSwap, onGoToStep, setButtonActions])

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

      <TransactionStatus
        txHash={swapTxHash || state.swapTxHash || undefined}
        isTxFailed={!!swapError || !!state.swapError}
        failureMessage="Swap TX failed."
      />
    </>
  )
}
