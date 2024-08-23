import { useStakeRIF } from '@/app/user/Stake/hooks/useStakeRIF'
import { StakePreview } from '@/app/user/Stake/StakePreview'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { config } from '@/config'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useEffect, useRef, useState } from 'react'

export const StepAllowance = ({ onGoNext = () => {}, onCloseModal = () => {} }: StepProps) => {
  const {
    amount,
    tokenToSend,
    tokenToReceive,
    stakePreviewFrom: from,
    stakePreviewTo: to,
  } = useStakingContext()

  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    customFooter,
    onRequestAllowance,
    isRequestingAllowance,
  } = useStakeRIF(amount, tokenToSend.contract, tokenToReceive.contract)

  const [isAllowanceRequestPending, setIsAllowanceRequestPending] = useState(false)

  const handleRequestAllowance = async () => {
    try {
      setIsAllowanceRequestPending(true)
      const txHash = await onRequestAllowance()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
    } catch (err) {
      console.error('Error requesting allowance', err)
    }
    setIsAllowanceRequestPending(false)
  }

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
      onConfirm={handleRequestAllowance}
      onCancel={onCloseModal}
      from={from}
      to={to}
      disableConfirm={isAllowanceReadLoading || isRequestingAllowance || isAllowanceRequestPending}
      actionName="Allowance"
      actionText="You need to request allowance before staking."
      customComponentBeforeFooter={customFooter}
      confirmButtonText="Request allowance"
      loading={isRequestingAllowance || isAllowanceRequestPending}
    />
  )
}
