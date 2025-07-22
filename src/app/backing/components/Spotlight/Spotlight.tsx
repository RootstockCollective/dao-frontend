import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { BackMoreBuildersCard, BuilderCardControl } from '@/app/shared/components/BuilderCard'
import { BuildersSpotlight } from '@/app/shared/components/BuildersSpotlight'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { Button } from '@/components/ButtonNew'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const Spotlight = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()

  const {
    state: {
      allocations,
      selections,
      backer: { amountToAllocate: totalOnchainAllocation },
      getBuilder,
    },
    actions: { toggleSelectedBuilder },
  } = useContext(AllocationsContext)

  const { randomBuilders } = useBuilderContext()

  const { data: estimatedBuilders, isLoading, error } = useGetBuilderEstimatedRewards()

  useHandleErrors({ error, title: 'Error loading builder estimated rewards' })

  const userSelections = useMemo(() => searchParams.get('builders')?.split(',') as Address[], [searchParams])

  useEffect(() => {
    if (userSelections) {
      userSelections.forEach(builder => !selections[builder] && toggleSelectedBuilder(builder))
    }
  }, [userSelections, toggleSelectedBuilder, selections])

  useEffect(() => {
    // TODO: remove this after implementing the highlight builders feature
    console.warn('😈 ~ BuildersSpotlight.tsx ~ Highlighted builders:', userSelections)
    console.warn('😈 ~ BuildersSpotlight.tsx ~ selections:', selections)
  }, [userSelections, selections])

  const hasAllocations = totalOnchainAllocation > 0n

  const allocatedBuilders = hasAllocations
    ? Object.keys(allocations).map(key => getBuilder(key as Address)!)
    : randomBuilders
  const spotlightBuilders = estimatedBuilders.filter(builder =>
    allocatedBuilders.map(b => b.address).includes(builder.address),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center self-center mt-6">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      {isConnected ? (
        <div className="grid grid-cols-4 gap-2 w-full items-stretch">
          {spotlightBuilders.map(builder => (
            <BuilderCardControl key={builder.address} {...builder} isInteractive={true} />
          ))}
          {hasAllocations && <BackMoreBuildersCard />}
        </div>
      ) : (
        <BuildersSpotlight builders={spotlightBuilders} />
      )}
      <div className="flex justify-center self-center mt-6">
        <Button variant="secondary-outline" onClick={() => router.push('/builders')}>
          See all Builders
        </Button>
      </div>
    </>
  )
}
