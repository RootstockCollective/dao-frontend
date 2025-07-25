import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { BackMoreBuildersCard, BuilderCardControl } from '@/app/shared/components/BuilderCard'
import { BuildersSpotlight } from '@/app/shared/components/BuildersSpotlight'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { Button } from '@/components/ButtonNew'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useContext, useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const Spotlight = ({ isInteractive = true }: { isInteractive?: boolean }) => {
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
      // include the new user selections into the selections object
      userSelections.forEach(builder => !selections[builder] && toggleSelectedBuilder(builder))
      // remove the old user selections if they are not in the new user selections
      Object.keys(selections).forEach(
        builder =>
          !userSelections.includes(builder as Address) &&
          selections[builder as Address] &&
          toggleSelectedBuilder(builder as Address),
      )
    }
  }, [userSelections, toggleSelectedBuilder, selections])

  const hasAllocations = useMemo(() => totalOnchainAllocation > 0n, [totalOnchainAllocation])

  const spotlightBuilders = useMemo(() => {
    // Get builders based on allocation or selection state
    let builderKeys: Address[] = []

    if (hasAllocations) {
      builderKeys = Object.keys(allocations) as Address[]
    } else if (userSelections?.length) {
      builderKeys = userSelections
    }

    // Resolve builder objects from keys or fallback to random builders
    const resolvedBuilders = builderKeys.length
      ? builderKeys.map(key => getBuilder(key)).filter(builder => !!builder)
      : randomBuilders

    const resolvedAddresses = resolvedBuilders.map(({ address }) => address)

    // Place builders from userSelections first, then the rest
    const sortedAddresses = [...new Set([...(userSelections ?? []), ...resolvedAddresses])]
    return (
      sortedAddresses
        // this is inefficient, but it's the only way to get the builders in the order we want
        .map(address => estimatedBuilders.find(b => b.address === address))
        .filter(builder => !!builder)
    )
  }, [estimatedBuilders, hasAllocations, allocations, getBuilder, randomBuilders, userSelections])

  const isBuilderSelected = useCallback(
    (builderAddress: Address) => {
      return userSelections?.includes(builderAddress) ?? false
    },
    [userSelections],
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
      {isConnected && isInteractive ? (
        <div className="grid grid-cols-4 gap-2 w-full items-stretch">
          {spotlightBuilders.map((builder, index) => (
            <BuilderCardControl
              key={builder.address}
              {...builder}
              isInteractive={true}
              index={index}
              showAnimation={isBuilderSelected(builder.address)}
            />
          ))}
          {hasAllocations && spotlightBuilders.length < 4 && <BackMoreBuildersCard />}
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
