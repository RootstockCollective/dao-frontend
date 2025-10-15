import { formatMetrics } from '@/app/collective-rewards/rewards'
import { NativeCurrency, RBTC, RIF, TOKENS, type Token } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'

interface UseBuilderUnclaimedRewardsProps {
  builder: Address
  gauge: Address
}

interface TokenRewardData {
  amount: string
  fiatAmount: string
  isLoading: boolean
  error: Error | null
}

interface UnclaimedRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
  isLoading: boolean
  error: Error | null
}

const useGetBuilderRewardsPerToken = (gauge: Address, token: Token | NativeCurrency) => {
  const { prices } = usePricesContext()
  const {
    data: rewards,
    isLoading: isLoading,
    error: error,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [token.address] })

  const price = prices[token.symbol]?.price ?? 0
  const formatted = formatMetrics(rewards ?? 0n, price, token.symbol)

  return {
    ...formatted,
    isLoading,
    error,
  }
}

export const useGetBuilderUnclaimedRewards = ({
  gauge,
}: UseBuilderUnclaimedRewardsProps): UnclaimedRewardsData => {
  const rifData = useGetBuilderRewardsPerToken(gauge, TOKENS[RIF])
  const rbtcData = useGetBuilderRewardsPerToken(gauge, TOKENS[RBTC])

  return {
    rif: {
      ...rifData,
    },
    rbtc: {
      ...rbtcData,
    },
    isLoading: rifData.isLoading || rbtcData.isLoading,
    error: rifData.error || rbtcData.error,
  }
}
