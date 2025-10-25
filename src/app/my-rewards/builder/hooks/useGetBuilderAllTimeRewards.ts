import { formatMetrics, useGetBuilderRewardsClaimedLogs } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { useMemo } from 'react'

interface UseBuilderAllTimeRewardsProps {
  gauge: Address
}

interface AllTimeRewardsData {
  rif: bigint
  rbtc: bigint
  usdrif: bigint
  isLoading: boolean
  error: Error | null
}

export const useGetBuilderAllTimeRewards = ({ gauge }: UseBuilderAllTimeRewardsProps): AllTimeRewardsData => {
  const { rif, rbtc, usdrif } = TOKENS

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

  const {
    data: usdrifClaimableRewards,
    isLoading: usdrifClaimableRewardsLoading,
    error: usdrifClaimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [usdrif.address] })

  const { rifAllTimeRewards, rbtcAllTimeRewards, usdrifAllTimeRewards } = useMemo(() => {
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

    const usdrifTotalClaimedRewards =
      builderRewardsPerToken[usdrif.address]?.reduce((acc, event) => {
        const amount = event.args.amount_ ?? 0n
        return acc + amount
      }, 0n) ?? 0n

    const rifAllTimeRewards = rifTotalClaimedRewards + (rifClaimableRewards ?? 0n)
    const rbtcAllTimeRewards = rbtcTotalClaimedRewards + (rbtcClaimableRewards ?? 0n)
    const usdrifAllTimeRewards = usdrifTotalClaimedRewards + (usdrifClaimableRewards ?? 0n)

    return {
      rifAllTimeRewards,
      rbtcAllTimeRewards,
      usdrifAllTimeRewards,
    }
  }, [builderRewardsPerToken, rifClaimableRewards, rbtcClaimableRewards, usdrifClaimableRewards])

  return {
    rif: rifAllTimeRewards,
    rbtc: rbtcAllTimeRewards,
    usdrif: usdrifAllTimeRewards,
    isLoading:
      builderRewardsPerTokenLoading ||
      rifClaimableRewardsLoading ||
      rbtcClaimableRewardsLoading ||
      usdrifClaimableRewardsLoading,
    error:
      builderRewardsPerTokenError ??
      rifClaimableRewardsError ??
      rbtcClaimableRewardsError ??
      usdrifClaimableRewardsError,
  }
}
