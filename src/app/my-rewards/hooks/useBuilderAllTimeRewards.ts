import { formatMetrics, useGetBuilderRewardsClaimedLogs } from '@/app/collective-rewards/rewards'
import { USD } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'

// FIXME: to be reviewed
interface UseBuilderAllTimeRewardsProps {
  gauge: Address
}

interface TokenRewardData {
  amount: string
  fiatAmount: string
  isLoading: boolean
  error: Error | null
}

interface AllTimeRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
}

export const useBuilderAllTimeRewards = ({ gauge }: UseBuilderAllTimeRewardsProps): AllTimeRewardsData => {
  const { prices } = usePricesContext()
  const { rif, rbtc } = TOKENS

  const {
    data: builderRewardsPerToken,
    isLoading: builderRewardsPerTokenLoading,
    error: builderRewardsPerTokenError,
  } = useGetBuilderRewardsClaimedLogs(gauge)

  const {
    data: rifClaimableRewards,
    isLoading: rifClaimableRewardsLoading,
    error: rifClaimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rif.address] })

  const {
    data: rbtcClaimableRewards,
    isLoading: rbtcClaimableRewardsLoading,
    error: rbtcClaimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rbtc.address] })

  // Calculate total claimed rewards for RIF
  const rifTotalClaimedRewards =
    builderRewardsPerToken[rif.address]?.reduce((acc, event) => {
      const amount = event.args.amount_ ?? 0n
      return acc + amount
    }, 0n) ?? 0n

  // Calculate total claimed rewards for rBTC
  const rbtcTotalClaimedRewards =
    builderRewardsPerToken[rbtc.address]?.reduce((acc, event) => {
      const amount = event.args.amount_ ?? 0n
      return acc + amount
    }, 0n) ?? 0n

  // Calculate total rewards (claimed + claimable)
  const rifTotalRewards = rifTotalClaimedRewards + (rifClaimableRewards ?? 0n)
  const rbtcTotalRewards = rbtcTotalClaimedRewards + (rbtcClaimableRewards ?? 0n)

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const rifFormatted = formatMetrics(rifTotalRewards, rifPrice, rif.symbol, USD)
  const rbtcFormatted = formatMetrics(rbtcTotalRewards, rbtcPrice, rbtc.symbol, USD)

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading: builderRewardsPerTokenLoading || rifClaimableRewardsLoading,
      error: builderRewardsPerTokenError ?? rifClaimableRewardsError,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading: builderRewardsPerTokenLoading || rbtcClaimableRewardsLoading,
      error: builderRewardsPerTokenError ?? rbtcClaimableRewardsError,
    },
  }
}
