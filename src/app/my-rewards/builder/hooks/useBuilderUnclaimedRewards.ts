import { Token } from '@/app/collective-rewards/rewards'
import { formatRewards } from '@/app/my-rewards/utils'
import { TOKENS } from '@/lib/tokens'
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
}

const useBuilderRewardsPerToken = (gauge: Address, token: Token) => {
  const { prices } = usePricesContext()
  const {
    data: rewards,
    isLoading: isLoading,
    error: error,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [token.address] })

  const price = prices[token.symbol]?.price ?? 0
  const formatted = formatRewards(rewards ?? 0n, price, token.symbol)

  return {
    ...formatted,
    isLoading,
    error,
  }
}

export const useBuilderUnclaimedRewards = ({
  gauge,
}: UseBuilderUnclaimedRewardsProps): UnclaimedRewardsData => {
  const { rif, rbtc } = TOKENS
  const rifData = useBuilderRewardsPerToken(gauge, rif)
  const rbtcData = useBuilderRewardsPerToken(gauge, rbtc)

  return {
    rif: {
      ...rifData,
    },
    rbtc: {
      ...rbtcData,
    },
  }
}
