import { Header, Label } from '@/components/Typography'
import { useEffect, useCallback, useMemo } from 'react'
import { SwapStepProps } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { useSwapInput, useTokenSelection, useTokenAllowance } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { executeTxFlow } from '@/shared/notification'
import { parseUnits, Hash } from 'viem'
import { USDT0 } from '@/lib/constants'
import Big from '@/lib/big'
import { formatForDisplay } from '@/lib/utils'

export const SwapStepTwo = ({ onGoNext, onGoBack, setButtonActions }: SwapStepProps) => {
  const { amountIn } = useSwapInput()
  const { tokenInData } = useTokenSelection()
  const { state, tokenData } = useSwappingContext()
  const { isApproving, hasSufficientAllowance, approve, refetchAllowance } = useTokenAllowance()

  // Calculate required amount - amountIn is always full precision
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
    if (requiredAmount === 0n) {
      return false
    }
    return hasSufficientAllowance(requiredAmount)
  }, [requiredAmount, hasSufficientAllowance])

  // Auto-advance if allowance is sufficient
  // Hook returns false while fetching, so this only triggers with fresh data
  useEffect(() => {
    if (isAllowanceEnough && !isApproving) {
      onGoNext()
    }
  }, [isAllowanceEnough, isApproving, onGoNext])

  // Calculate amount in currency using price from context
  const amountInCurrency = useMemo(() => {
    const priceValue = tokenData.prices[USDT0]
    return `$${Big(amountIn).times(priceValue).toFixed(2)}`
  }, [amountIn, tokenData.prices])

  const handleRequestAllowance = useCallback(() => {
    if (!requiredAmount || requiredAmount === 0n) {
      return
    }
    console.log('[SwapStepTwo] Requesting allowance for:', {
      amountIn,
      requiredAmount: requiredAmount.toString(),
      tokenDecimals: tokenInData.decimals,
    })
    executeTxFlow({
      onRequestTx: async () => {
        const txHash = await approve(requiredAmount)
        if (!txHash) {
          throw new Error('Transaction hash is null')
        }
        return txHash as Hash
      },
      onSuccess: async () => {
        // After transaction is confirmed, refetch allowance and verify it's sufficient
        const { data: permit2AllowanceData } = await refetchAllowance()

        // Permit2 returns [amount, expiration, nonce], extract the amount
        const newAllowance = Array.isArray(permit2AllowanceData)
          ? permit2AllowanceData[0]
          : permit2AllowanceData

        if (!newAllowance || typeof newAllowance !== 'bigint' || newAllowance < requiredAmount) {
          throw new Error(
            `Allowance verification failed. Current: ${newAllowance?.toString() || 'unknown'}, Required: ${requiredAmount.toString()}`,
          )
        }

        onGoNext()
      },
      action: 'allowance',
    })
  }, [requiredAmount, approve, refetchAllowance, onGoNext])

  // Set button actions
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Request allowance',
        onClick: handleRequestAllowance,
        disabled: !amountIn || !Big(amountIn).gt(0) || isAllowanceEnough || isApproving,
        loading: isApproving,
        isTxPending: isApproving,
      },
      secondary: {
        label: 'Back',
        onClick: onGoBack,
        disabled: isApproving, // Disable back button while approving
        loading: false,
      },
    })
  }, [amountIn, isAllowanceEnough, isApproving, handleRequestAllowance, onGoBack, setButtonActions])

  // At step 2, amountIn should always exist (user came from step 1)
  if (!amountIn) {
    // This shouldn't happen, but handle gracefully
    return null
  }

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
          amount={formatForDisplay(amountIn)}
          tokenSymbol={tokenInData.symbol}
          amountInCurrency={amountInCurrency}
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
