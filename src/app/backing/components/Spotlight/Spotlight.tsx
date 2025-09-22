import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { BuilderCardControl } from '@/app/shared/components/BuilderCard'
import { SpotlightBuildersGrid } from '@/app/shared/components/SpotlightBuildersGrid'
import { useBackingContext } from '@/app/shared/context/BackingContext'
import { useRewardsContext } from '@/app/shared/context/RewardsContext/RewardsContext'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const Spotlight = ({ isInteractive = true }: { isInteractive?: boolean }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()

  const {
    backings,
    totalBacking: { onchain: totalOnchainBacking },
    isLoading: isBackingLoading,
    error: backingError,
  } = useBackingContext()

  const {
    data: backingRewards,
    isLoading: isBackingRewardsLoading,
    error: backingRewardsError,
  } = useRewardsContext()

  const { randomBuilders, getBuilderByAddress } = useBuilderContext()

  const isLoading = isBackingLoading || isBackingRewardsLoading
  useHandleErrors([
    { error: backingError, title: 'Error loading backing data' },
    { error: backingRewardsError, title: 'Error loading rewards data' },
  ])

  const userSelections = useMemo(() => searchParams.get('builders')?.split(',') as Address[], [searchParams])
  const hasAllocations = isConnected && totalOnchainBacking > 0n

  const spotlightBuilders = useMemo(() => {
    // Get builders based on allocation or selection state
    let builderKeys: Address[] = []

    if (hasAllocations) {
      builderKeys = Object.keys(backings) as Address[]
    } else if (userSelections?.length) {
      builderKeys = userSelections
    }

    // Resolve builder objects from keys or fallback to random builders
    const resolvedBuilders = builderKeys.length
      ? builderKeys.map(key => getBuilderByAddress(key)).filter(builder => !!builder)
      : randomBuilders

    const resolvedAddresses = resolvedBuilders.map(({ address }) => address)

    // Place builders from userSelections first, then the rest
    const sortedAddresses = [...new Set([...(userSelections ?? []), ...resolvedAddresses])]
    return (
      sortedAddresses
        // this is inefficient, but it's the only way to get the builders in the order we want
        .map(address => backingRewards.find(b => b.address === address))
        .filter(builder => !!builder)
    )
  }, [backingRewards, hasAllocations, backings, getBuilderByAddress, randomBuilders, userSelections])

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
      <SpotlightBuildersGrid showBackMoreBuildersCard={hasAllocations && spotlightBuilders.length < 4}>
        {spotlightBuilders.map((builder, index) => (
          <BuilderCardControl
            key={builder.address}
            builder={builder}
            index={index}
            isInteractive={isInteractive}
            estimatedRewards={builder.backerEstimatedRewards}
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
