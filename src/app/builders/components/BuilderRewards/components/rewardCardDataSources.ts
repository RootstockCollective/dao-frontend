import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { useBuilderAllTimeRewards } from '../hooks/useBuilderAllTimeRewards'
import { useBuilderAllTimeShare } from '../hooks/useBuilderAllTimeShare'
import { useBuilderLastCycleRewards } from '../hooks/useBuilderLastCycleRewards'
import { useBuilderEstimatedRewards } from '../hooks/useBuilderEstimatedRewards'
import { useBuilderUnclaimedRewards } from '../hooks/useBuilderUnclaimedRewards'
import { type RewardType } from './RewardCardRenderer'

// Data source interface for dependency injection
export interface RewardCardDataSource {
  getRewardData: (
    type: RewardType,
    tokens: BuilderRewardDetails['tokens'],
    builder: BuilderRewardDetails['builder'] | undefined,
    gauge: BuilderRewardDetails['gauge'],
    gauges: BuilderRewardDetails['gauges'],
    currency: string | undefined,
  ) => any
}

// Real data source using hooks
export const useRewardCardRealData = (
  type: RewardType,
  tokens: BuilderRewardDetails['tokens'],
  builder: BuilderRewardDetails['builder'] | undefined,
  gauge: BuilderRewardDetails['gauge'],
  gauges: BuilderRewardDetails['gauges'],
  currency: string | undefined,
) => {
  const { rif, rbtc } = tokens

  // Call all hooks at the top level to follow Rules of Hooks
  const unclaimedData = useBuilderUnclaimedRewards({
    builder: builder!,
    gauge,
    tokens: { rif, rbtc },
    currency,
  })
  const allTimeRewardsData = useBuilderAllTimeRewards({ gauge, tokens: { rif, rbtc }, currency })
  const lastCycleData = useBuilderLastCycleRewards({ gauge, tokens: { rif, rbtc }, currency })
  const estimatedData = useBuilderEstimatedRewards({
    builder: builder!,
    gauge,
    tokens: { rif, rbtc },
    currency,
  })
  const allTimeShareData = useBuilderAllTimeShare({ gauge, gauges, tokens: { rif } })

  // Get the appropriate data based on type
  const getRewardData = () => {
    switch (type) {
      case 'unclaimed':
        return unclaimedData
      case 'allTimeRewards':
        return allTimeRewardsData
      case 'lastCycle':
        return lastCycleData
      case 'estimatedThisCycle':
        return estimatedData
      case 'allTimeShare':
        return allTimeShareData
      default:
        throw new Error(`Unknown reward type: ${type}`)
    }
  }

  return getRewardData()
}

// Mock data source implementation
export const createMockDataSource = (): RewardCardDataSource => ({
  getRewardData: type => {
    const MOCK_DATA: Record<RewardType, any> = {
      unclaimed: {
        rif: { amount: '1,234.56', fiatAmount: '2,469.12 USD', isLoading: false },
        rbtc: { amount: '0.85', fiatAmount: '1,700.00 USD', isLoading: false },
      },
      allTimeRewards: {
        rif: { amount: '12,345.67', fiatAmount: '24,691.34 USD', isLoading: false },
        rbtc: { amount: '8.75', fiatAmount: '17,500.00 USD', isLoading: false },
      },
      lastCycle: {
        rif: { amount: '890.12', fiatAmount: '1,780.24 USD', isLoading: false },
        rbtc: { amount: '0.65', fiatAmount: '1,300.00 USD', isLoading: false },
      },
      estimatedThisCycle: {
        rif: { amount: '567.89', fiatAmount: '1,135.78 USD', isLoading: false },
        rbtc: { amount: '0.42', fiatAmount: '840.00 USD', isLoading: false },
      },
      allTimeShare: {
        amount: '15.7%',
        isLoading: false,
      },
    }

    return MOCK_DATA[type]
  },
})
