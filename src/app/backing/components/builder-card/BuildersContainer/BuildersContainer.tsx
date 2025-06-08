import { BuilderCardContainer } from '@/app/backing/components/builder-card/BuilderCard/BuilderCardContainer'
import { useGetEstimatedBackersRewardsPct } from '@/app/collective-rewards/shared/hooks/useGetEstimatedBackersRewardsPct'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { useShuffledArray } from './useShuffledArray'
import { Builder, BackerRewardsConfig } from '@/app/collective-rewards/types'

export const BuildersContainer: FC = () => {
  const { data: builders, isLoading, error } = useGetEstimatedBackersRewardsPct()
  const [showAll, setShowAll] = useState(false)
  const router = useRouter()
  const shuffledBuilders = useShuffledArray<Builder>(builders)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div>Error loading builders: {error.message}</div>
  }

  if (!transformedBuilders || transformedBuilders.length === 0) {
    return <div>No builders found</div>
  }

  const transformedBuilders = shuffledBuilders.map((builder: Builder) => {
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

  const spotlightBuilders = 4
  const visibleBuilders = showAll ? transformedBuilders : transformedBuilders.slice(0, spotlightBuilders)

  return (
    <>
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {visibleBuilders.map(builder => (
          <BuilderCardContainer key={builder.address} {...builder} />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Button variant="secondary" className="py-3 px-4" onClick={() => setShowAll(prev => !prev)}>
          {showAll ? 'See less' : 'See all Builders'}
        </Button>
      </div>
    </>
  )
}
