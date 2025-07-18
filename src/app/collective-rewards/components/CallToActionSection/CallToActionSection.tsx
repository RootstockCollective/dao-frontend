import { BackersCallToAction } from '../BackersCallToAction'
import { BuildersCallToAction } from '../BuildersCallToAction'
import { InfoContainer } from '@/components/containers'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useHandleErrors } from '../../utils'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { getTokens } from '@/lib/tokens'

export const CallToActionSection = () => {
  const {
    data: builderEstimatedRewards,
    isLoading: builderEstimatedRewardsLoading,
    error: builderEstimatedRewardsError,
  } = useGetBuilderEstimatedRewards(getTokens())

  const isLoading = builderEstimatedRewardsLoading
  const error = builderEstimatedRewardsError
  useHandleErrors({ error, title: 'Error loading CTA section' })

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

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <InfoContainer className="flex-row p-0 pt-1">
      <BackersCallToAction rifRewards={rifBackerRewards} rbtcRewards={rbtcBackerRewards} />
      <BuildersCallToAction rifRewards={rifBuilderRewards} rbtcRewards={rbtcBuilderRewards} />
    </InfoContainer>
  )
}
