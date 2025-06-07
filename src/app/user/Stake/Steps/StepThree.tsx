import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { config } from '@/config'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { Divider } from '../components/Divider'
import { StepActionButtons } from '../components/StepActionButtons'
import { TokenAmountDisplay } from '../components/TokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useStakeRIF } from '../hooks/useStakeRIF'

export const StepThree = ({ onGoToStep, onCloseModal }: StepProps) => {
  const { amount, tokenToReceive, stakePreviewFrom: from, stakePreviewTo: to } = useStakingContext()

  const { onRequestStake, isRequesting, isTxPending, isTxFailed, stakeHash } = useStakeRIF(
    amount,
    tokenToReceive.contract,
  )

  const handleConfirmStake = async () => {
    try {
      const txHash = await onRequestStake()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      onCloseModal()
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        console.error('Error requesting stake', err)
      }
    }
  }

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

      <TransactionStatus txHash={stakeHash} isTxFailed={isTxFailed} failureMessage="Stake TX failed." />

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
