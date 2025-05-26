import { StakePreview } from '@/app/user/Stake/StakePreview'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'
import { StepProps } from '@/app/user/Stake/types'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'
import { showToast } from '@/shared/lib/toastUtils'
import { TX_MESSAGES } from '@/shared/txMessages'

export const StepTwo = ({ onGoNext, onCloseModal = () => {} }: StepProps) => {
  const {
    amount,
    setStakeTxHash,
    tokenToSend,
    tokenToReceive,
    actionToUse,
    actionName,
    stakePreviewFrom: from,
    stakePreviewTo: to,
  } = useStakingContext()
  const { trackTransaction } = useTxStatusContext()

  const { onConfirm: onConfirmAction, isPending } = actionToUse(
    amount,
    tokenToSend.contract,
    tokenToReceive.contract,
  )

  const onConfirm = async () => {
    try {
      const txHash = await onConfirmAction()
      setStakeTxHash?.(txHash)
      trackTransaction(txHash)
      onGoNext?.()
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        showToast(TX_MESSAGES.staking.error)
      }
    }
  }

  return (
    <StakePreview
      onConfirm={onConfirm}
      onCancel={onCloseModal}
      disableConfirm={false}
      from={from}
      to={to}
      actionName={textsDependingOnAction[actionName].preview}
      actionText={textsDependingOnAction[actionName].previewText}
      loading={isPending}
    />
  )
}
