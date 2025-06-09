import { BuilderCardContainer } from '@/app/backing/components/builder-card/BuilderCard/BuilderCardContainer'
import { useGetEstimatedBackersRewardsPct } from '@/app/collective-rewards/shared/hooks/useGetEstimatedBackersRewardsPct'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useShuffledArray } from './useShuffledArray'
import { Builder, BackerRewardsConfig } from '@/app/collective-rewards/types'

export const BuildersContainer: FC = () => {
  const { data: builders, isLoading, error } = useGetEstimatedBackersRewardsPct()
  const router = useRouter()
  const shuffledBuilders = useShuffledArray<Builder>(builders)
  useHandleErrors({ error, title: 'Error loading builders' })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!builders || builders.length === 0) {
    return <div className="p-4">No builders found</div>
  }

  const spotlightBuilders = shuffledBuilders.map((builder: Builder) => {
    const backerRewardPercentage: BackerRewardsConfig = {
      active: builder.backerRewardPercentage?.active ?? 0n,
      previous: builder.backerRewardPercentage?.previous ?? 0n,
      next: builder.backerRewardPercentage?.next ?? 0n,
      cooldown: builder.backerRewardPercentage?.cooldown ?? 0n,
    }

    return {
      ...builder,
      backerRewardPercentage,
    }
  })

  const spotlightBuildersNumber = 4
  const visibleBuilders = spotlightBuilders.slice(0, spotlightBuildersNumber)

  return (
    <>
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {visibleBuilders.map(builder => (
          <BuilderCardContainer key={builder.address} {...builder} />
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
