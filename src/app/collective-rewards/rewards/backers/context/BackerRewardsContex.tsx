import { createContext, FC, ReactNode, useContext } from 'react'
import {
  Token,
  BackerRewardsClaimedEventLog,
  useGetGaugesBackerRewardsClaimed,
} from '@/app/collective-rewards/rewards'
import { Address } from 'viem'
import { useGaugesGetFunction } from '@/app/collective-rewards//shared'

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
}

export const BackerRewardsContext = createContext<BackerRewardsContextValue>({
  data: {},
  isLoading: false,
  error: null,
  gaugesWithEarns: () => [],
})

type BackerRewardsProviderProps = {
  children: ReactNode
  backer: Address
  gauges: Address[]
  tokens: {
    [token: string]: Token
  }
}

const useGetTokenRewards = (backer: Address, token: Token, gauges: Address[]) => {
  const {
    data: earned,
    isLoading: earnedLoading,
    error: earnedError,
  } = useGaugesGetFunction(gauges, 'earned', [token.address, backer])
  const {
    data: estimated,
    isLoading: estimatedLoading,
    error: estimatedError,
  } = useGaugesGetFunction(gauges, 'estimatedBackerRewards', [token.address, backer])
  const {
    data: claimed,
    isLoading: claimedLoading,
    error: claimedError,
  } = useGetGaugesBackerRewardsClaimed(gauges, token.address, backer)

  const isLoading = earnedLoading || estimatedLoading || claimedLoading
  const error = earnedError ?? estimatedError ?? claimedError

  return {
    data: {
      earned,
      claimed,
      estimated,
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
  gauges,
  tokens: { rif, rbtc },
}) => {
  const { data: rifRewards, isLoading: rifLoading, error: rifError } = useGetTokenRewards(backer, rif, gauges)
  const {
    data: rbtcRewards,
    isLoading: rbtcLoading,
    error: rbtcError,
  } = useGetTokenRewards(backer, rbtc, gauges)

  const isLoading = rifLoading || rbtcLoading
  const error = rifError ?? rbtcError

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
  }

  return <BackerRewardsContext.Provider value={valueOfContext}>{children}</BackerRewardsContext.Provider>
}

export const useBackerRewardsContext = () => useContext(BackerRewardsContext)
