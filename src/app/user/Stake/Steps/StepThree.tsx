import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { Divider } from '@/components/Divider'
import { waitForTx } from '@/shared/lib/waitForTx'
import { useCallback } from 'react'
import { StepActionButtons } from '../components/StepActionButtons'
import { TokenAmountDisplay } from '../components/TokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useStakeRIF } from '../hooks/useStakeRIF'

export const StepThree = ({ onGoToStep, onCloseModal }: StepProps) => {
  const { amount, tokenToReceive, stakePreviewFrom: from, stakePreviewTo: to } = useStakingContext()

  const { onRequestStake, isRequesting, isTxPending, isTxFailed, stakeTxHash } = useStakeRIF(
    amount,
    tokenToReceive.contract,
  )

  const handleConfirmStake = useCallback(() => {
    waitForTx({
      onRequestTx: onRequestStake,
      onSuccess: onCloseModal,
      action: 'staking',
    })
  }, [onRequestStake, onCloseModal])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <TokenAmountDisplay
          label="From"
          amount={amount}
          tokenSymbol={from.tokenSymbol}
          amountInCurrency={from.amountConvertedToCurrency}
          balance={from.balance}
        />
        <TokenAmountDisplay
          label="To"
          amount={amount}
          tokenSymbol={to.tokenSymbol}
          balance={to.balance}
          isFlexEnd
        />
      </div>

      <TransactionStatus txHash={stakeTxHash} isTxFailed={isTxFailed} failureMessage="Stake TX failed." />

      <Divider />

      <StepActionButtons
        primaryButton={{
          label: isRequesting ? 'Requesting...' : 'Confirm stake',
          onClick: handleConfirmStake,
          disabled: !amount || Number(amount) <= 0,
        }}
        secondaryButton={{
          label: 'Back',
          onClick: () => onGoToStep(0),
        }}
        isTxPending={isTxPending}
        isRequesting={isRequesting}
      />
    </>
  )
}
