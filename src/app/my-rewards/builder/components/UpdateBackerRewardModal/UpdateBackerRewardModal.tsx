import { useBuilderSettingsContext } from '@/app/collective-rewards/settings/builder/context'
import { percentageToWei, weiToPercentage } from '@/app/collective-rewards/settings/utils/weiUtils'
import UpdateBackerRewardViewModal from './UpdateBackerRewardViewModal'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { DateTime, Duration } from 'luxon'
import { useState, useEffect } from 'react'

interface UpdateBackerRewardModalProps {
  onClose: () => void
  className?: string
}

function formatDuration(duration: bigint | undefined) {
  if (!duration) return undefined
  return Duration.fromObject({ seconds: Number(duration) }).shiftTo('days', 'hours', 'minutes')
}

export const UpdateBackerRewardModal = ({ onClose, className }: UpdateBackerRewardModalProps) => {
  const {
    current: { data: rewardData, isLoading: isRewardsLoading },
    update: { setNewReward, isPending: isTxPending },
    isBuilderOperational,
  } = useBuilderSettingsContext()

  const isCooldownElapsed = rewardData?.cooldownEndTime.toSeconds() < DateTime.now().toSeconds()
  const previousReward = rewardData ? Number(weiToPercentage(rewardData.previous, 0)) : 0
  const nextReward = rewardData ? Number(weiToPercentage(rewardData.next, 0)) : 0
  const currentReward = isCooldownElapsed ? nextReward : previousReward

  const [updatedReward, setUpdatedReward] = useState<number>(0)

  useEffect(() => {
    setUpdatedReward(nextReward || previousReward)
  }, [nextReward, previousReward])

  const { data: rewardPercentageCooldown, isPending: isCooldownPending } = useReadBuilderRegistry({
    functionName: 'rewardPercentageCooldown',
  })

  const cooldownDuration = formatDuration(rewardPercentageCooldown)
  const alreadySubmitted = updatedReward === currentReward

  const handleSave = async (updatedRewardValue: string) => {
    if (!isBuilderOperational) return
    if (alreadySubmitted) return

    await setNewReward(percentageToWei(updatedRewardValue))
    onClose()
  }

  const handleRewardChange = (newReward: string) => {
    setUpdatedReward(Number(newReward))
  }

  return (
    <UpdateBackerRewardViewModal
      className={className}
      currentReward={currentReward}
      updatedReward={updatedReward}
      alreadySubmitted={alreadySubmitted}
      suggestedReward={undefined} // FIXME: Get the suggested reward. out of scope atm.
      onSave={handleSave}
      onRewardChange={handleRewardChange}
      cooldownDuration={cooldownDuration}
      isTxPending={isTxPending}
      isLoading={isRewardsLoading || isCooldownPending}
      isOperational={isBuilderOperational}
      onClose={onClose}
    />
  )
}

export default UpdateBackerRewardModal
