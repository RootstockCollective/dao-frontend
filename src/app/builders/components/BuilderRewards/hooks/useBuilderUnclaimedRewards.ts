import { formatMetrics } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { Token } from '@/app/collective-rewards/rewards'

interface UseBuilderUnclaimedRewardsProps {
  builder: Address
  gauge: Address
  tokens: {
    rif: Token
    rbtc: Token
  }
  currency?: string
}

interface TokenRewardData {
  amount: string
  fiatAmount: string
  isLoading: boolean
}

interface UnclaimedRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
}

const useFormattedBuilderRewards = (gauge: Address, token: Token, currency = 'USD') => {
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
  tokens: { rif, rbtc },
  currency = 'USD',
}: UseBuilderUnclaimedRewardsProps): UnclaimedRewardsData => {
  const { error: rifError, ...rifRest } = useFormattedBuilderRewards(gauge, rif, currency)
  const { error: rbtcError, ...rbtcRest } = useFormattedBuilderRewards(gauge, rbtc, currency)

  useHandleErrors({ error: rifError || rbtcError, title: 'Error loading rewards' })

  return {
    rif: {
      ...rifRest,
    },
    rbtc: {
      ...rbtcRest,
    },
  }
}
