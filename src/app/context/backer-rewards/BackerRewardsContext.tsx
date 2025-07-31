'use client'

import { BackerRewardsClaimedEventLog, useGetGaugesBackerRewardsClaimed } from '@/app/hooks'
import { CompleteBuilder, StateWithUpdate, Token } from '@/app/types'
import { filterBuildersByState } from '@/app/utils'
import { useBuilderContext } from '@/app/context'
import { useReadGauges } from '@/shared/hooks/contracts'
import { createContext, FC, ReactNode, useContext, useMemo, useState } from 'react'
import { Address } from 'viem'

export type TokenBackerRewards = {
  earned: Record<Address, bigint>
  claimed: Record<Address, BackerRewardsClaimedEventLog>
  estimated: Record<Address, bigint>
}

type BackerRewardsContextValue = {
  data: {
    [token: string]: TokenBackerRewards
  }
  isLoading: boolean
  error: Error | null
  gaugesWithEarns: (rewardToken?: Address) => Address[]
  detailedView: StateWithUpdate<boolean>
}

export const BackerRewardsContext = createContext<BackerRewardsContextValue>({
  data: {},
  isLoading: false,
  error: null,
  gaugesWithEarns: () => [],
  detailedView: {
    value: false,
    onChange: () => {},
  },
})

type BackerRewardsProviderProps = {
  children: ReactNode
  backer: Address
  tokens: {
    [token: string]: Token
  }
}

function mapToRecord(rewardsAmount: (bigint | undefined)[], gauges: `0x${string}`[]) {
  return rewardsAmount.reduce<Record<Address, bigint>>((acc, value, i) => {
    acc[gauges[i]] = value as bigint
    return acc
  }, {})
}

const useGetTokenRewards = (backer: Address, token: Token, gauges: Address[]) => {
  const {
    data: earned,
    isLoading: earnedLoading,
    error: earnedError,
  } = useReadGauges({ addresses: gauges, functionName: 'earned', args: [token.address, backer] })
  const {
    data: estimated,
    isLoading: estimatedLoading,
    error: estimatedError,
  } = useReadGauges({
    addresses: gauges,
    functionName: 'estimatedBackerRewards',
    args: [token.address, backer],
  })
  const {
    data: claimed,
    isLoading: claimedLoading,
    error: claimedError,
  } = useGetGaugesBackerRewardsClaimed(gauges, token.address, backer)

  const isLoading = earnedLoading || estimatedLoading || claimedLoading
  const error = earnedError ?? estimatedError ?? claimedError

  return {
    data: {
      earned: mapToRecord(earned, gauges),
      claimed,
      estimated: mapToRecord(estimated, gauges),
    },
    isLoading,
    error,
  }
}

const getEarnedAddresses = (rewards: Record<Address, bigint>) =>
  Object.keys(rewards).filter(key => rewards[key as Address] > 0n) as Address[]

export const BackerRewardsContextProvider: FC<BackerRewardsProviderProps> = ({
  children,
  backer,
  tokens: { rif, rbtc },
}) => {
  const { builders, isLoading: buildersLoading, error: buildersError } = useBuilderContext()
  const gauges = useMemo(() => {
    const filteredBuilders = filterBuildersByState<CompleteBuilder>(builders)
    return filteredBuilders.map(({ gauge }) => gauge)
  }, [builders])

  const { data: rifRewards, isLoading: rifLoading, error: rifError } = useGetTokenRewards(backer, rif, gauges)
  const {
    data: rbtcRewards,
    isLoading: rbtcLoading,
    error: rbtcError,
  } = useGetTokenRewards(backer, rbtc, gauges)
  const [isDetailedView, setIsDetailedView] = useState(false)

  const isLoading = buildersLoading || rifLoading || rbtcLoading
  const error = buildersError ?? rifError ?? rbtcError

  const data: { [token: string]: TokenBackerRewards } = {
    [rif.address]: rifRewards,
    [rbtc.address]: rbtcRewards,
  }

  const gaugesWithEarns = (rewardToken?: Address) => {
    if (!rewardToken) {
      const allRewards = Object.values(data).flatMap(tokenRewards => getEarnedAddresses(tokenRewards.earned))
      return Array.from(new Set(allRewards))
    }

    const { earned } = data[rewardToken]
    return getEarnedAddresses(earned)
  }

  const valueOfContext: BackerRewardsContextValue = {
    data,
    isLoading,
    error,
    gaugesWithEarns,
    detailedView: { value: isDetailedView, onChange: setIsDetailedView },
  }

  return <BackerRewardsContext.Provider value={valueOfContext}>{children}</BackerRewardsContext.Provider>
}

export const useBackerRewardsContext = () => useContext(BackerRewardsContext)
