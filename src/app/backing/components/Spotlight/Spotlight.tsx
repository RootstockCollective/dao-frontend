import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { BuilderCardControl, BackMoreBuildersCard } from '@/app/shared/components/BuilderCard'
import {} from '@/app/shared/components/BuilderCard'
import { BuildersSpotlight } from '@/app/shared/components/BuildersSpotlight'
import { Button } from '@/components/ButtonNew'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useContext } from 'react'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { getTokens } from '@/lib/tokens'
import { Address } from 'viem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const Spotlight = () => {
  const router = useRouter()
  const { isConnected } = useAccount()

  const {
    state: {
      allocations,
      backer: { amountToAllocate: totalOnchainAllocation },
      getBuilder,
    },
  } = useContext(AllocationsContext)

  const { randomBuilders } = useBuilderContext()

  const { data: estimatedBuilders, isLoading, error } = useGetBuilderEstimatedRewards(getTokens())

  useHandleErrors({ error, title: 'Error loading builder estimated rewards' })

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
