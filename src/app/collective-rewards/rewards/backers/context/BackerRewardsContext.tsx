'use client'

import {
  BackerRewardsClaimedEventLog,
  Token,
  useGetGaugesBackerRewardsClaimed,
} from '@/app/collective-rewards/rewards'
import { CompleteBuilder, StateWithUpdate } from '@/app/collective-rewards/types'
import { filterBuildersByState, useBuilderContext } from '@/app/collective-rewards/user'
import { useReadGauges } from '@/shared/hooks/contracts'
import { createContext, FC, ReactNode, useContext, useMemo, useState } from 'react'
import { Address } from 'viem'

export interface TokenBackerRewards {
  earned: Record<Address, bigint>
  claimed: Record<Address, BackerRewardsClaimedEventLog>
  estimated: Record<Address, bigint>
}

interface BackerRewardsContextValue {
  data: {
    [token: string]: TokenBackerRewards
  }
  isLoading: boolean
  error: Error | null
  gaugesWithEarns: (rewardToken?: Address) => Address[]
  detailedView: StateWithUpdate<boolean>
}

const BackerRewardsContext = createContext<BackerRewardsContextValue>({
  data: {},
  isLoading: false,
  error: null,
  gaugesWithEarns: () => [],
  detailedView: {
    value: false,
    onChange: () => {},
  },
})

interface BackerRewardsProviderProps {
  children: ReactNode
  backer: Address
  tokens: {
    [token: string]: Token
  }
}

function mapToRecord(rewardsAmount: (bigint | undefined)[], gauges: `0x${string}`[]) {
  return rewardsAmount.reduce<Record<Address, bigint>>((acc, value, i) => {
    acc[gauges[i]] = value ?? 0n
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
  tokens: { rif, rbtc, usdrif },
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
  const {
    data: usdrifRewards,
    isLoading: usdrifLoading,
    error: usdrifError,
  } = useGetTokenRewards(backer, usdrif, gauges)
  const [isDetailedView, setIsDetailedView] = useState(false)

  const isLoading = buildersLoading || rifLoading || rbtcLoading || usdrifLoading
  const error = buildersError ?? rifError ?? rbtcError ?? usdrifError

  const data: { [token: string]: TokenBackerRewards } = {
    [rif.address]: rifRewards,
    [rbtc.address]: rbtcRewards,
    [usdrif.address]: usdrifRewards,
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
