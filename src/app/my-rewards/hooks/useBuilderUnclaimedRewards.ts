import { formatMetrics } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { Token } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'
import { USD } from '@/lib/constants'

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

const useFormattedBuilderRewards = (gauge: Address, token: Token, currency = USD) => {
  const { prices } = usePricesContext()
  const {
    data: rewards,
    isLoading: isLoading,
    error: error,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [token.address] })

  const price = prices[token.symbol]?.price ?? 0
  const formatted = formatMetrics(rewards ?? 0n, price, token.symbol, currency)

  return {
    amount: formatted.amount,
    fiatAmount: formatted.fiatAmount,
    isLoading: isLoading,
    error: error,
  }
}

export const useBuilderUnclaimedRewards = ({
  gauge,
}: UseBuilderUnclaimedRewardsProps): UnclaimedRewardsData => {
  const { rif, rbtc } = TOKENS
  const rifData = useFormattedBuilderRewards(gauge, rif, USD)
  const rbtcData = useFormattedBuilderRewards(gauge, rbtc, USD)

  return {
    rif: {
      ...rifData,
    },
    rbtc: {
      ...rbtcData,
    },
  }
}
