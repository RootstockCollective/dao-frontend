import { BackersCallToAction } from '../BackersCallToAction'
import { BuildersCallToAction } from '../BuildersCallToAction'
import { InfoContainer } from '@/components/containers'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useHandleErrors } from '../../utils'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'

export const CallToActionSection = () => {
  const {
    data: builderEstimatedRewards,
    isLoading: builderEstimatedRewardsLoading,
    error: builderEstimatedRewardsError,
  } = useGetBuilderEstimatedRewards()

  useHandleErrors({ error: builderEstimatedRewardsError, title: 'Error loading CTA section' })

  const { rifBackerRewards, rbtcBackerRewards, rifBuilderRewards, rbtcBuilderRewards } =
    builderEstimatedRewards.reduce(
      (acc, builder) => {
        return {
          rifBackerRewards: acc.rifBackerRewards + builder.backerEstimatedRewards.rif.amount.value,
          rbtcBackerRewards: acc.rbtcBackerRewards + builder.backerEstimatedRewards.rbtc.amount.value,
          rifBuilderRewards: acc.rifBuilderRewards + builder.builderEstimatedRewards.rif.amount.value,
          rbtcBuilderRewards: acc.rbtcBuilderRewards + builder.builderEstimatedRewards.rbtc.amount.value,
        }
      },
      { rifBackerRewards: 0n, rbtcBackerRewards: 0n, rifBuilderRewards: 0n, rbtcBuilderRewards: 0n },
    )

  if (builderEstimatedRewardsLoading) {
    return <LoadingSpinner />
  }

  return (
    <InfoContainer className="flex-row p-0 pt-1">
      <BackersCallToAction rifRewards={rifBackerRewards} rbtcRewards={rbtcBackerRewards} className="w-1/2" />
      <BuildersCallToAction
        rifRewards={rifBuilderRewards}
        rbtcRewards={rbtcBuilderRewards}
        className="w-1/2"
      />
    </InfoContainer>
  )
}
