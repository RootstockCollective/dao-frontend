import { useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards/hooks/useGetBackersRewardPercentage'
import { Builder, RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user/hooks/useGetBuildersByState'
import { isBuilderRewardable, useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { FC, useContext } from 'react'
import { useShuffledArray } from '../../hooks/useShuffledArray'
import { BuilderCardControl } from '../BuilderCard/BuilderCardControl'
import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { Button } from '@/components/ButtonNew'
import { BackMoreBuildersCard } from '../BuilderCard/BackMoreBuildersCard'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Address } from 'viem'

const SPOTLIGHT_BUILDERS = 4

interface BuildersSpotlightProps {
  rewardsData: BuildersRewards[]
}

export const BuildersSpotlight: FC<BuildersSpotlightProps> = ({ rewardsData }) => {
  const {
    state: {
      allocations,
      builders,
      isContextLoading,
      getBuilder,
      backer: { amountToAllocate: totalOnchainAllocation },
    },
  } = useContext(AllocationsContext)

  const hasAllocations = totalOnchainAllocation > 0n

  const randomBuilders = useShuffledArray<Builder>(Object.values(builders)).filter(({ stateFlags }) =>
    isBuilderRewardable(stateFlags),
  )

  const allocatedBuilders = Object.entries(allocations).map(([key, value]) => {
    const builder = getBuilder(key as Address)!
    return {
      ...builder,
    }
  })

  const buildersToShow = hasAllocations ? allocatedBuilders : randomBuilders.slice(0, SPOTLIGHT_BUILDERS)

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
