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

export const useBuilderUnclaimedRewards = ({
  gauge,
  tokens: { rif, rbtc },
  currency = 'USD',
}: UseBuilderUnclaimedRewardsProps): UnclaimedRewardsData => {
  const { prices } = usePricesContext()

  // RIF rewards
  const {
    data: rifRewards,
    isLoading: rifLoading,
    error: rifError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rif.address] })

  // rBTC rewards
  const {
    data: rbtcRewards,
    isLoading: rbtcLoading,
    error: rbtcError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rbtc.address] })

  useHandleErrors({ error: rifError, title: 'Error loading RIF rewards' })
  useHandleErrors({ error: rbtcError, title: 'Error loading rBTC rewards' })

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const rifFormatted = formatMetrics(rifRewards ?? 0n, rifPrice, rif.symbol, currency)
  const rbtcFormatted = formatMetrics(rbtcRewards ?? 0n, rbtcPrice, rbtc.symbol, currency)

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading: rifLoading,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading: rbtcLoading,
    },
  }
}
