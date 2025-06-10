import { useGetEstimatedBackersRewardsPct } from '@/app/collective-rewards/shared/hooks/useGetEstimatedBackersRewardsPct'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useShuffledArray } from '../../hooks/useShuffledArray'
import { Builder, BackerRewardsConfig, RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards/hooks/useGetBackersRewardPercentage'
import { useGetBuildersByState } from '@/app/collective-rewards/user/hooks/useGetBuildersByState'
import { BuilderCardControl } from '../BuilderCard/BuilderCardControl'
import { BackerRewardPercentage } from '@/app/collective-rewards/rewards/types'

const SPOTLIGHT_BUILDERS = 4

export const BuildersSpotlight: FC = () => {
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
    return {
      ...builder,
      backerRewardPct: buildersWithBackerRewards[builder.address],
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
      <div className="flex justify-center mt-6">
        <Button variant="secondary" className="py-3 px-4" onClick={() => router.push('/builders')}>
          See all Builders
        </Button>
      </div>
    </>
  )
}
