import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakeRIF } from '@/app/user/Stake/hooks/useStakeRIF'
import { useEffect } from 'react'

export const StepAllowance = ({ onGoNext = () => {}, onCloseModal = () => {} }: StepProps) => {
  const {
    amount,
    tokenToSend,
    tokenToReceive,
    stakePreviewFrom: from,
    stakePreviewTo: to,
  } = useStakingContext()

  const { isAllowanceEnough, customFooter } = useStakeRIF(
    amount,
    tokenToSend.contract,
    tokenToReceive.contract,
  )

  const actionText = isAllowanceEnough
    ? 'You have enough allowance to stake.'
    : 'You need to request allowance before staking.'

  useEffect(() => {
    if (isAllowanceEnough) {
      onGoNext()
    }
  }, [isAllowanceEnough, onGoNext])

  return (
    <StakePreview
      onConfirm={onGoNext}
      onCancel={onCloseModal}
      from={from}
      to={to}
      actionName="Allowance"
      actionText={actionText}
      customComponentBeforeFooter={customFooter}
      confirmButtonText="Continue"
    />
  )
}
