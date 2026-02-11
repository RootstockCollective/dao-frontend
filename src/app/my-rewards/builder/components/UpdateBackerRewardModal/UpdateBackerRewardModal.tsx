import { useBuilderSettingsContext } from '@/app/collective-rewards/settings/builder/context'
import { percentageToWei, weiToPercentage } from '@/app/collective-rewards/settings/utils/weiUtils'
import UpdateBackerRewardViewModal from './UpdateBackerRewardViewModal'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { DateTime, Duration } from 'luxon'
import { useState, useEffect, useMemo } from 'react'

interface Props {
  onClose: () => void
}

function formatDuration(duration: bigint | undefined) {
  if (!duration) return undefined
  return Duration.fromObject({ seconds: Number(duration) }).shiftTo('days', 'hours', 'minutes')
}

export const UpdateBackerRewardModal = ({ onClose }: Props) => {
  const {
    current: { data: rewardData, isLoading: isRewardsLoading, refetch: refetchRewards },
    update: { setNewReward, isPending: isTxPending, isSuccess: isTxSuccess },
    isBuilderOperational,
  } = useBuilderSettingsContext()

  const isCooldownActive = rewardData?.cooldownEndTime.toSeconds() > DateTime.now().toSeconds()
  const previousReward = rewardData ? Number(weiToPercentage(rewardData.previous, 0)) : 0
  const nextReward = rewardData ? Number(weiToPercentage(rewardData.next, 0)) : 0
  const currentReward = isCooldownActive ? previousReward : nextReward

  const [updatedReward, setUpdatedReward] = useState<number>(0)

  useEffect(() => {
    setUpdatedReward(nextReward || previousReward)
  }, [nextReward, previousReward])

  const { data: rewardPercentageCooldown, isPending: isCooldownPending } = useReadBuilderRegistry({
    functionName: 'rewardPercentageCooldown',
  })

  const { data: maxRewardPercentageWei } = useReadBuilderRegistry({
    functionName: 'maxRewardPercentage',
  })

  const maxRewardPercentage = maxRewardPercentageWei
    ? Number(weiToPercentage(maxRewardPercentageWei, 0))
    : undefined

  const cooldownDuration = formatDuration(rewardPercentageCooldown)
  const alreadySubmitted = useMemo(() => updatedReward === nextReward, [updatedReward, nextReward])

  const handleSave = async (updatedRewardValue: string) => {
    if (!isBuilderOperational) return
    if (alreadySubmitted) return

    await setNewReward(percentageToWei(updatedRewardValue))
    onClose()
  }

  useEffect(() => {
    if (isTxSuccess) {
      refetchRewards()
    }
  }, [isTxSuccess, refetchRewards])

  const handleRewardChange = (newReward: string) => {
    setUpdatedReward(Number(newReward))
  }

  return (
    <UpdateBackerRewardViewModal
      currentReward={currentReward}
      updatedReward={updatedReward}
      onSave={handleSave}
      onRewardChange={handleRewardChange}
      alreadySubmitted={alreadySubmitted}
      cooldownDuration={cooldownDuration}
      maxRewardPercentage={maxRewardPercentage}
      // TODO: suggested reward out of scope atm.
      suggestedReward={undefined}
      isTxPending={isTxPending}
      isLoading={isRewardsLoading || isCooldownPending}
      isOperational={isBuilderOperational}
      onClose={onClose}
    />
  )
}
