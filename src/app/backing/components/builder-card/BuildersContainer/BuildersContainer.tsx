import { BuilderCardContainer } from '@/app/backing/components/builder-card/BuilderCard/BuilderCardContainer'
import { useGetEstimatedBackersRewardsPct } from '@/app/collective-rewards/shared/hooks/useGetEstimatedBackersRewardsPct'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FC, useState, useRef } from 'react'

export const BuildersContainer: FC = () => {
  const { data: builders, isLoading, error } = useGetEstimatedBackersRewardsPct()
  const [showAll, setShowAll] = useState(false)
  // Generate a random seed once per session
  const seedRef = useRef<number>(Math.floor(Math.random() * 1_000_000_000))

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div>Error loading builders: {error.message}</div>
  }

  const transformedBuilders = builders
    ? seededShuffle(builders, seedRef.current).map(builder => ({
        ...builder,
        backerRewardPercentage: {
          active: builder.rewardPercentage?.current ?? 0n,
          previous: builder.rewardPercentage?.current ?? 0n,
          next: builder.rewardPercentage?.next ?? 0n,
          cooldown: builder.rewardPercentage?.cooldownEndTime ?? 0n,
        },
      }))
    : []

  if (!transformedBuilders || transformedBuilders.length === 0) {
    return <div>No builders found</div>
  }

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

// Seeded shuffle
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array]
  const random = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Simple seeded random number generator (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
