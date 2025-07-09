import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { Builder } from '@/app/collective-rewards/types'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Button } from '@/components/ButtonNew'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { FC, useContext } from 'react'
import { Address } from 'viem'
import { BackMoreBuildersCard } from '../BuilderCard/BackMoreBuildersCard'
import { BuilderCardControl } from '../BuilderCard/BuilderCardControl'

const SPOTLIGHT_BUILDERS = 4

interface BuildersSpotlightProps {
  rewardsData: BuildersRewards[]
}

export const BuildersSpotlight: FC<BuildersSpotlightProps> = ({ rewardsData }) => {
  const {
    state: {
      allocations,
      randomBuilders,
      isContextLoading,
      getBuilder,
      backer: { amountToAllocate: totalOnchainAllocation },
      contextError,
    },
  } = useContext(AllocationsContext)

  useHandleErrors({ error: contextError, title: 'Error loading builders spotlight' })

  const hasAllocations = totalOnchainAllocation > 0n

  const allocatedBuilders = Object.keys(allocations).map(key => getBuilder(key as Address)!)

  const buildersToShow = hasAllocations ? allocatedBuilders : randomBuilders

  const router = useRouter()

  if (isContextLoading) {
    return <LoadingSpinner />
  }

  if (!buildersToShow || buildersToShow.length === 0) {
    return <div className="p-4">No builders found</div>
  }

  const spotlightBuilders = buildersToShow.map((builder: Builder) => {
    const builderRewards = rewardsData.find(r => r.address === builder.address)

    return {
      ...builder,
      estimatedRewards: builderRewards?.estimatedRewards,
    }
  })

  return (
    <>
      <div className="grid grid-cols-4 gap-2 w-full items-stretch">
        {spotlightBuilders.map(builder => (
          <BuilderCardControl key={builder.address} {...builder} />
        ))}
        {hasAllocations && <BackMoreBuildersCard />}
      </div>
      <div className="flex justify-center self-center mt-6">
        <Button variant="secondary-outline" onClick={() => router.push('/builders')}>
          See all Builders
        </Button>
      </div>
    </>
  )
}
