import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { Builder } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { BuilderCardControl } from '@/app/shared/components/BuilderCard'
import { SpotlightBuildersGrid } from '@/app/shared/components/SpotlightBuildersGrid'
import { useBackingContext } from '@/app/shared/context/BackingContext'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useContext, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const Spotlight = ({ isInteractive = true }: { isInteractive?: boolean }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()

  const {
    state: { allocations, selections, getBuilder },
    initialState: {
      backer: { amountToAllocate: totalOnchainAllocation },
    },
    actions: { toggleSelectedBuilder },
  } = useContext(AllocationsContext)

  const { randomBuilders, isLoading: isBuildersLoading } = useBuilderContext()

  const {
    data: backingData,
    isLoading: isBackingDataLoading,
    error: isBackingDataError,
  } = useBackingContext()

  useHandleErrors({ error: isBackingDataError, title: 'Error loading backing data' })

  const userSelections = useMemo(() => searchParams.get('builders')?.split(',') as Address[], [searchParams])

  const selectionsKey = userSelections?.join(',') ?? ''
  useMemo(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionsKey])

  const hasAllocations = useMemo(() => {
    return isConnected && totalOnchainAllocation > 0n
  }, [totalOnchainAllocation, isConnected])

  const needsBackingData = hasAllocations || userSelections?.length > 0

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
      ? builderKeys.map(key => getBuilder(key)).filter((builder): builder is Builder => !!builder)
      : randomBuilders

    const resolvedAddresses = resolvedBuilders.map(({ address }) => address)

    // Place builders from userSelections first, then the rest
    const sortedAddresses = [...new Set([...(userSelections ?? []), ...resolvedAddresses])]

    // If we don't need backing data (disconnected, no allocations, no selections),
    // use basic builder data directly for faster loading
    if (!needsBackingData && randomBuilders.length > 0) {
      return randomBuilders
    }

    return (
      sortedAddresses
        // this is inefficient, but it's the only way to get the builders in the order we want
        .map(address => backingData.find(b => b.address === address))
        .filter(builder => !!builder)
    )
  }, [backingData, hasAllocations, allocations, getBuilder, randomBuilders, userSelections, needsBackingData])

  const getEstimatedRewards = useCallback(
    (builderAddress: Address) => {
      return backingData.find(b => b.address === builderAddress)?.backerEstimatedRewards
    },
    [backingData],
  )

  const isBuilderSelected = useCallback(
    (builderAddress: Address) => {
      return userSelections?.includes(builderAddress) ?? false
    },
    [userSelections],
  )
  const isLoading =
    (needsBackingData ? isBackingDataLoading : isBuildersLoading) || spotlightBuilders.length === 0

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <SpotlightBuildersGrid showBackMoreBuildersCard={hasAllocations && spotlightBuilders.length < 4}>
        {spotlightBuilders.map((builder, index) => (
          <BuilderCardControl
            key={builder.address}
            builder={builder}
            index={index}
            isInteractive={isInteractive}
            estimatedRewards={getEstimatedRewards(builder.address)}
            showAnimation={isBuilderSelected(builder.address)}
          />
        ))}
      </SpotlightBuildersGrid>
      <div className="flex justify-center self-center mt-6">
        <Button variant="secondary-outline" onClick={() => router.push('/builders')}>
          See all Builders
        </Button>
      </div>
    </>
  )
}
