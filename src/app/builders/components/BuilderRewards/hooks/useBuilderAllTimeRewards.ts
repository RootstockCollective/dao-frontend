import { useGetBuilderRewardsClaimedLogs, formatMetrics } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { Token } from '@/app/collective-rewards/rewards'

interface UseBuilderAllTimeRewardsProps {
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

interface AllTimeRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
}

export const useBuilderAllTimeRewards = ({
  gauge,
  tokens: { rif, rbtc },
  currency = 'USD',
}: UseBuilderAllTimeRewardsProps): AllTimeRewardsData => {
  const { prices } = usePricesContext()

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

  useHandleErrors({ error: builderRewardsPerTokenError, title: 'Error loading all time rewards (claimed logs)' })
  useHandleErrors({ error: rifClaimableRewardsError, title: 'Error loading all time rewards (RIF claimable)' })
  useHandleErrors({ error: rbtcClaimableRewardsError, title: 'Error loading all time rewards (rBTC claimable)' })

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

  const rifFormatted = formatMetrics(rifTotalRewards, rifPrice, rif.symbol, currency)
  const rbtcFormatted = formatMetrics(rbtcTotalRewards, rbtcPrice, rbtc.symbol, currency)

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading: builderRewardsPerTokenLoading || rifClaimableRewardsLoading,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading: builderRewardsPerTokenLoading || rbtcClaimableRewardsLoading,
    },
  }
} 