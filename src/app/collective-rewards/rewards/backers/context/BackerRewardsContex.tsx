import { createContext, FC, ReactNode, useContext } from 'react'
import {
  useGetBackerRewards,
  Token,
  BackerRewardsClaimedEventLog,
  useGetGaugesBackerRewardsClaimed,
} from '@/app/collective-rewards/rewards'
import { Address } from 'viem'

type TokenRewards = {
  earned: Record<Address, bigint>
  claimed: Record<Address, BackerRewardsClaimedEventLog>
  estimated: Record<Address, bigint>
}

type BackerRewardsContextValue = {
  data: {
    [token: string]: TokenRewards
  }
  isLoading: boolean
  error: Error | null
}

export const BackerRewardsContext = createContext<BackerRewardsContextValue>({
  data: {},
  isLoading: false,
  error: null,
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
  } = useGetBackerRewards(backer, token.address, gauges, 'earned')
  const {
    data: claimed,
    isLoading: claimedLoading,
    error: claimedError,
  } = useGetGaugesBackerRewardsClaimed(gauges, token.address, backer)
  const {
    data: estimated,
    isLoading: estimatedLoading,
    error: estimatedError,
  } = useGetBackerRewards(backer, token.address, gauges, 'estimatedBackerRewards')

  const isLoading = earnedLoading || claimedLoading || estimatedLoading
  const error = earnedError ?? claimedError ?? estimatedError

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

  const valueOfContext: BackerRewardsContextValue = {
    data: {
      [rif.address]: rifRewards,
      [rbtc.address]: rbtcRewards,
    },
    isLoading,
    error,
  }

  return <BackerRewardsContext.Provider value={valueOfContext}>{children}</BackerRewardsContext.Provider>
}

export const useBackerRewardsContext = () => useContext(BackerRewardsContext)
