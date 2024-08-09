import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'

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
    } catch (errorConfirming) {
      console.log(errorConfirming) // @TODO implement error handling
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
