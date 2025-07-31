import { useGetBuilderRewardsClaimedLogs } from '@/app/hooks'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { formatRewards } from '@/app/my-rewards/utils'
import { useMemo } from 'react'

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

export const useGetBuilderAllTimeRewards = ({ gauge }: UseBuilderAllTimeRewardsProps): AllTimeRewardsData => {
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

  const rifTotalRewards = useMemo(() => {
    const rifTotalRewards = rifTotalClaimedRewards + (rifClaimableRewards ?? 0n)
    const rifPrice = prices[rif.symbol]?.price ?? 0
    return formatRewards(rifTotalRewards, rifPrice, rif.symbol)
  }, [rifTotalClaimedRewards, rifClaimableRewards, prices, rif.symbol])

  // Calculate total claimed rewards for rBTC
  const rbtcTotalClaimedRewards =
    builderRewardsPerToken[rbtc.address]?.reduce((acc, event) => {
      const amount = event.args.amount_ ?? 0n
      return acc + amount
    }, 0n) ?? 0n

  const rbtcTotalRewards = useMemo(() => {
    const rbtcTotalRewards = rbtcTotalClaimedRewards + (rbtcClaimableRewards ?? 0n)
    const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
    return formatRewards(rbtcTotalRewards, rbtcPrice, rbtc.symbol)
  }, [rbtcTotalClaimedRewards, rbtcClaimableRewards, prices, rbtc.symbol])

  return {
    rif: {
      amount: rifTotalRewards.amount,
      fiatAmount: rifTotalRewards.fiatAmount,
      isLoading: builderRewardsPerTokenLoading || rifClaimableRewardsLoading,
      error: builderRewardsPerTokenError ?? rifClaimableRewardsError,
    },
    rbtc: {
      amount: rbtcTotalRewards.amount,
      fiatAmount: rbtcTotalRewards.fiatAmount,
      isLoading: builderRewardsPerTokenLoading || rbtcClaimableRewardsLoading,
      error: builderRewardsPerTokenError ?? rbtcClaimableRewardsError,
    },
  }
}
