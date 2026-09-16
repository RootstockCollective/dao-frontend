import { useMemo } from 'react'
import { Address } from 'viem'

import { getClaimedForToken, useGetBuilderRewardsClaimed } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'

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
  const {
    data: claimed,
    isLoading: builderRewardsPerTokenLoading,
    error: builderRewardsPerTokenError,
  } = useGetBuilderRewardsClaimed(gauge)

  const {
    data: rifClaimableRewards,
    isLoading: rifClaimableRewardsLoading,
    error: rifClaimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [TOKENS.rif.address] })

  const {
    data: rbtcClaimableRewards,
    isLoading: rbtcClaimableRewardsLoading,
    error: rbtcClaimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [TOKENS.rbtc.address] })

  const {
    data: usdrifClaimableRewards,
    isLoading: usdrifClaimableRewardsLoading,
    error: usdrifClaimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [TOKENS.usdrif.address] })

  const { rifAllTimeRewards, rbtcAllTimeRewards, usdrifAllTimeRewards } = useMemo(() => {
    // BuilderRewardsClaimed is accumulated per claim by the subgraph, so these are values, not
    // lists to reduce.
    const rifTotalClaimedRewards = getClaimedForToken(claimed, TOKENS.rif.address)
    const rbtcTotalClaimedRewards = getClaimedForToken(claimed, TOKENS.rbtc.address)
    const usdrifTotalClaimedRewards = getClaimedForToken(claimed, TOKENS.usdrif.address)

    const rifAllTimeRewards = rifTotalClaimedRewards + (rifClaimableRewards ?? 0n)
    const rbtcAllTimeRewards = rbtcTotalClaimedRewards + (rbtcClaimableRewards ?? 0n)
    const usdrifAllTimeRewards = usdrifTotalClaimedRewards + (usdrifClaimableRewards ?? 0n)

    return {
      rifAllTimeRewards,
      rbtcAllTimeRewards,
      usdrifAllTimeRewards,
    }
  }, [claimed, rifClaimableRewards, rbtcClaimableRewards, usdrifClaimableRewards])

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
