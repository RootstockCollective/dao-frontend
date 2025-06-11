import { useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards/hooks/useGetBackersRewardPercentage'
import { Builder, RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user/hooks/useGetBuildersByState'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { useShuffledArray } from '../../hooks/useShuffledArray'
import { BuilderCardControl } from '../BuilderCard/BuilderCardControl'
import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'

const SPOTLIGHT_BUILDERS = 4

interface BuildersSpotlightProps {
  rewardsData: BuildersRewards[]
}

export const BuildersSpotlight: FC<BuildersSpotlightProps> = ({ rewardsData }) => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>()

  const {
    data: buildersWithBackerRewards,
    isLoading,
    error,
  } = useGetBackersRewardPercentage(builders.map(({ address }) => address))

  const router = useRouter()
  const shuffledBuilders = useShuffledArray<Builder>(builders)

  useHandleErrors({ error, title: 'Error loading builders' })
  useHandleErrors({ error: buildersError, title: 'Error loading builders' })

  if (isLoading || buildersLoading) {
    return <LoadingSpinner />
  }

  if (!buildersWithBackerRewards || Object.keys(buildersWithBackerRewards).length === 0) {
    return <div className="p-4">No builders found</div>
  }

  const spotlightBuilders = shuffledBuilders.map((builder: Builder) => {
    const builderRewards = rewardsData.find(r => r.address === builder.address)

    return {
      ...builder,
      backerRewardPct: buildersWithBackerRewards[builder.address],
      estimatedRewards: builderRewards?.estimatedRewards,
    }
  })

  const visibleBuilders = spotlightBuilders.slice(0, SPOTLIGHT_BUILDERS)

  return (
    <>
      <div
        className="grid gap-2 justify-center w-full"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
      >
        {visibleBuilders.map(builder => (
          <BuilderCardControl key={builder.address} {...builder} />
        ))}
      </div>
      <div className="flex justify-center self-center mt-6">
        <Button variant="secondary" className="py-3 px-4" onClick={() => router.push('/builders')}>
          See all Builders
        </Button>
      </div>
    </>
  )
}
