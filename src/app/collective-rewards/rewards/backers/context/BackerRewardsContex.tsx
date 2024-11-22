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
  getRewardByGauge: <Type extends bigint | BackerRewardsClaimedEventLog>(
    rewardToken: Address,
    gauge: Address,
    type: keyof TokenBackerRewards,
  ) => Type | undefined
}

export const BackerRewardsContext = createContext<BackerRewardsContextValue>({
  data: {},
  isLoading: false,
  error: null,
  getRewardByGauge: () => undefined,
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
  // TODO: change from to estimatedBackerRewards once the contracts are updated
  const {
    data: estimated,
    isLoading: estimatedLoading,
    error: estimatedError,
  } = useGaugesGetFunction(gauges, 'earned', [token.address, backer])
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

  const getRewardByGauge = <Type,>(rewardToken: Address, gauge: Address, type: keyof TokenBackerRewards) => {
    return data[rewardToken][type][gauge] as Type
  }

  const valueOfContext: BackerRewardsContextValue = {
    data,
    isLoading,
    error,
    getRewardByGauge,
  }

  return <BackerRewardsContext.Provider value={valueOfContext}>{children}</BackerRewardsContext.Provider>
}

export const useBackerRewardsContext = () => useContext(BackerRewardsContext)
