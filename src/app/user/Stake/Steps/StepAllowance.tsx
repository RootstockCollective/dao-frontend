import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakeRIF } from '@/app/user/Stake/hooks/useStakeRIF'

export const StepAllowance = ({ onGoNext = () => {}, onCloseModal = () => {} }: StepProps) => {
  const {
    amount,
    tokenToSend,
    tokenToReceive,
    stakePreviewFrom: from,
    stakePreviewTo: to,
  } = useStakingContext()

  console.log('from', JSON.stringify(from) )

  const { shouldEnableConfirm, customFooter } = useStakeRIF(
    amount,
    tokenToSend.contract,
    tokenToReceive.contract,
  )

  const actionText = !shouldEnableConfirm
    ? 'You need to request allowance before staking.'
    : 'You have enough allowance to stake.'
  return (
    <StakePreview
      onConfirm={onGoNext}
      onCancel={onCloseModal}
      disableConfirm={!shouldEnableConfirm}
      from={from}
      to={to}
      actionName="Allowance"
      actionText={actionText}
      customComponentBeforeFooter={customFooter}
    />
  )
}
