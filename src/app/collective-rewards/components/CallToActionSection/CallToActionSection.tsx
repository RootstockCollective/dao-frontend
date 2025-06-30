import { useGetCycleRewards } from '../../shared/hooks/useGetCycleRewards'
import { useGetEstimatedRewardsPct } from '../../shared'
import { BackersCallToAction } from '../BackersCallToAction'
import { BuildersCallToAction } from '../BuildersCallToAction'
import { InfoContainer } from '@/components/containers'
import { WeiPerEther } from '@/lib/constants'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useHandleErrors } from '../../utils'

export const CallToActionSection = () => {
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useGetEstimatedRewardsPct()
  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const isLoading = buildersLoading || cycleRewardsLoading
  const error = buildersError ?? cycleRewardsError
  useHandleErrors({ error, title: 'Error loading CTA section' })

  const totalRewardsPct = builders.reduce(
    (acc, builder) => {
      const { estimatedBackerRewardsPct, estimatedBuilderRewardsPct } = builder
      return {
        estimatedBackerRewardsPct: acc.estimatedBackerRewardsPct + estimatedBackerRewardsPct,
        estimatedBuilderRewardsPct: acc.estimatedBuilderRewardsPct + estimatedBuilderRewardsPct,
      }
    },
    { estimatedBackerRewardsPct: 0n, estimatedBuilderRewardsPct: 0n },
  )

  const rifBuilderRewards =
    (totalRewardsPct.estimatedBuilderRewardsPct * cycleRewards.rifRewards) / WeiPerEther
  const rbtcBuilderRewards =
    (totalRewardsPct.estimatedBuilderRewardsPct * cycleRewards.rbtcRewards) / WeiPerEther
  const rifBackerRewards = (totalRewardsPct.estimatedBackerRewardsPct * cycleRewards.rifRewards) / WeiPerEther
  const rbtcBackerRewards =
    (totalRewardsPct.estimatedBackerRewardsPct * cycleRewards.rbtcRewards) / WeiPerEther

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <InfoContainer className="flex-row">
      <BackersCallToAction rifRewards={rifBackerRewards} rbtcRewards={rbtcBackerRewards} />
      <BuildersCallToAction rifRewards={rifBuilderRewards} rbtcRewards={rbtcBuilderRewards} />
    </InfoContainer>
  )
}
