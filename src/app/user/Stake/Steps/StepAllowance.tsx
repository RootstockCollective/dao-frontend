import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakeRIF } from '@/app/user/Stake/hooks/useStakeRIF'
import { useEffect, useRef, useState } from 'react'

export const StepAllowance = ({ onGoNext = () => {}, onCloseModal = () => {} }: StepProps) => {
  const {
    amount,
    tokenToSend,
    tokenToReceive,
    stakePreviewFrom: from,
    stakePreviewTo: to,
  } = useStakingContext()

  const { isAllowanceEnough, isAllowanceReadLoading, customFooter } = useStakeRIF(
    amount,
    tokenToSend.contract,
    tokenToReceive.contract,
  )

  const hasCalledOnGoNextRef = useRef(false)
  useEffect(() => {
    if (isAllowanceEnough && !hasCalledOnGoNextRef.current) {
      // prevent calling onGoNext multiple times, it's only happening locally.
      hasCalledOnGoNextRef.current = true
      onGoNext()
    }
  }, [isAllowanceEnough, onGoNext])

  return (
    <StakePreview
      onConfirm={onGoNext}
      onCancel={onCloseModal}
      from={from}
      to={to}
      disableConfirm={isAllowanceReadLoading}
      actionName="Allowance"
      actionText="You need to request allowance before staking."
      customComponentBeforeFooter={customFooter}
      confirmButtonText="Continue"
    />
  )
}
