import { STAKING_MESSAGES } from '@/app/proposals/shared/utils'
import { useAlertContext } from '@/app/providers'
import { StakePreview } from '@/app/user/Stake/StakePreview'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'
import { StepProps } from '@/app/user/Stake/types'

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
  const { setMessage } = useAlertContext()

  const { onConfirm: onConfirmAction, isPending } = actionToUse(
    amount,
    tokenToSend.contract,
    tokenToReceive.contract,
  )

  const onConfirm = async () => {
    try {
      const txHash = await onConfirmAction()
      setStakeTxHash?.(txHash)
      onGoNext?.()
    } catch (err: any) {
      if (err?.cause?.code !== 4001) {
        setMessage(STAKING_MESSAGES.error)
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
