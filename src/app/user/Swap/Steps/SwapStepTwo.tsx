import { Header, Label } from '@/components/Typography'
import { useEffect, useCallback, useMemo } from 'react'
import { SwapStepProps } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { useSwapInput, useTokenSelection, useTokenAllowance } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { executeTxFlow } from '@/shared/notification'
import { parseUnits, Hash } from 'viem'
import { USDT0 } from '@/lib/constants'
import Big from '@/lib/big'

export const SwapStepTwo = ({ onGoNext, onGoBack, setButtonActions }: SwapStepProps) => {
  const { amountIn } = useSwapInput()
  const { tokenInData } = useTokenSelection()
  const { balances, prices } = useBalancesContext()
  const { state } = useSwappingContext()
  const { allowance, isApproving, hasSufficientAllowance, approve } = useTokenAllowance()

  // At step 2, amountIn should always exist (user came from step 1)
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

  // Check if allowance is sufficient
  const requiredAmount = useMemo(() => {
    if (!amountIn || !tokenInData.decimals) {
      return 0n
    }
    try {
      return parseUnits(amountIn, tokenInData.decimals)
    } catch {
      return 0n
    }
  }, [amountIn, tokenInData.decimals])

  const isAllowanceEnough = useMemo(() => {
    if (!allowance || requiredAmount === 0n) {
      return false
    }
    return hasSufficientAllowance(requiredAmount)
  }, [allowance, requiredAmount, hasSufficientAllowance])

  const handleRequestAllowance = useCallback(() => {
    if (!requiredAmount || requiredAmount === 0n) {
      return
    }
    executeTxFlow({
      onRequestTx: async () => {
        const txHash = await approve(requiredAmount)
        if (!txHash) {
          throw new Error('Transaction hash is null')
        }
        return txHash as Hash
      },
      onSuccess: onGoNext,
      action: 'allowance',
    })
  }, [requiredAmount, approve, onGoNext])

  // Auto-advance if allowance is sufficient
  useEffect(() => {
    if (isAllowanceEnough) {
      onGoNext()
    }
  }, [isAllowanceEnough, onGoNext])

  // Set button actions
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Request allowance',
        onClick: handleRequestAllowance,
        disabled: !amountIn || !Big(amountIn).gt(0) || isAllowanceEnough,
        loading: isApproving,
        isTxPending: isApproving,
      },
      secondary: {
        label: 'Back',
        onClick: onGoBack,
        disabled: false,
        loading: false,
      },
    })
  }, [amountIn, isAllowanceEnough, isApproving, handleRequestAllowance, onGoBack, setButtonActions])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">{tokenInData.symbol} smart contract</Header>
          </div>
        </div>
        <StakeTokenAmountDisplay
          label="Allowance amount"
          amount={amountIn}
          tokenSymbol={tokenInData.symbol}
          amountInCurrency={from.amountConvertedToCurrency}
          isFlexEnd
        />
      </div>

      <TransactionStatus
        txHash={state.approvalTxHash || undefined}
        isTxFailed={false}
        failureMessage="Allowance TX failed."
      />
    </>
  )
}
