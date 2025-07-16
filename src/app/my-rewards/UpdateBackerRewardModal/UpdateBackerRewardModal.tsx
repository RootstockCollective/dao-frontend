import { useBuilderSettingsContext } from '@/app/collective-rewards/settings/builder/context'
import { percentageToWei, weiToPercentage } from '@/app/collective-rewards/settings/utils/weiUtils'
import UpdateBackerRewardViewModal from '@/app/my-rewards/UpdateBackerRewardModal/UpdateBackerRewardViewModal'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { Duration } from 'luxon'
import { useState, useEffect } from 'react'

interface UpdateBackerRewardModalProps {
  onClose: () => void
  className?: string
}

function formatDuration(duration: bigint | undefined) {
  if (!duration) return undefined
  return Duration.fromObject({ seconds: Number(duration) }).shiftTo('days', 'hours', 'minutes')
}

const UpdateBackerRewardModal = ({ onClose, className }: UpdateBackerRewardModalProps) => {
  const {
    current: { data: currentRewardData, isLoading: isCurrentRewardsLoading },
    update: { setNewReward, isPending: isTxPending },
    isBuilderOperational,
  } = useBuilderSettingsContext()

  const currentReward = currentRewardData ? Number(weiToPercentage(currentRewardData.previous, 0)) : 0
  const [updatedReward, setUpdatedReward] = useState<number>(0)

  useEffect(() => {
    setUpdatedReward(currentReward)
  }, [currentReward])

  const { data: rewardPercentageCooldown, isPending: isCooldownPending } = useReadBuilderRegistry({
    functionName: 'rewardPercentageCooldown',
  })

  const cooldownDuration = formatDuration(rewardPercentageCooldown)

  const handleSave = async (updatedRewardValue: string) => {
    if (!isBuilderOperational) return

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
      suggestedReward={undefined} // FIXME: Get the suggested reward. out of scope atm.
      onSave={handleSave}
      onRewardChange={handleRewardChange}
      cooldownDuration={cooldownDuration}
      isTxPending={isTxPending}
      isLoading={isCurrentRewardsLoading || isCooldownPending}
      isOperational={isBuilderOperational}
      onClose={onClose}
    />
  )
}

export default UpdateBackerRewardModal
