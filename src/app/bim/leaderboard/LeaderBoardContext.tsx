import { createContext, ReactNode, useContext } from 'react'
import { useGetBuilderRewards } from '@/app/bim/leaderboard/hooks/useGetBuilderRewards'
import { usePricesContext, withPricesContextProvider } from '@/shared/context/PricesContext'
import { RIF, USD, USD_SYMBOL } from '@/lib/constants'

type Currency = {
  value: number
  symbol: string
}

type FiatCurrency = Currency & {
  currency: string
}

export type Reward = {
  onChain: Currency
  fiat: FiatCurrency
}

export type LeaderRewardInfo = {
  name: string
  lastEpochReward: Reward
  projectedReward: Reward
  performance: number
}

export type LeaderBoardContextProps = {
  data: LeaderRewardInfo[]
  isLoading: boolean
  error: Error | null
}

export const LeaderBoardContext = createContext<LeaderBoardContextProps>({
  data: [],
  isLoading: false,
  error: null,
})

interface Props {
  children: ReactNode
}

export const LeaderBoardContextProvider = ({ children }: Props) => {
  const { data: builders, isLoading, error } = useGetBuilderRewards()
  const { prices } = usePricesContext()

  const data: LeaderRewardInfo[] = builders.map(
    ({ name, lastEpochReward, projectedReward, performance }) => ({
      name,
      lastEpochReward: {
        onChain: {
          value: lastEpochReward,
          symbol: RIF,
        },
        fiat: {
          value: lastEpochReward * (prices.RIF?.price ?? 0),
          currency: USD,
          symbol: USD_SYMBOL,
        },
      },
      projectedReward: {
        onChain: {
          value: projectedReward,
          symbol: RIF,
        },
        fiat: {
          value: projectedReward * (prices.RIF?.price ?? 0),
          currency: USD,
          symbol: USD_SYMBOL,
        },
      },
      performance,
    }),
  )
  const valueToUse = { data, isLoading, error }
  return <LeaderBoardContext.Provider value={valueToUse}>{children}</LeaderBoardContext.Provider>
}

export const useLeaderBoardContext = () => useContext(LeaderBoardContext)

export const LeaderBoardContextProviderWithPrices = withPricesContextProvider(LeaderBoardContextProvider)
