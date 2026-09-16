import { useMemo } from 'react'
import { Address } from 'viem'

import {
  getClaimedForToken,
  getTokenTotal,
  useGetBuilderRewardsClaimed,
  useGetTotalRewardsDistributed,
} from '@/app/collective-rewards/rewards'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'

interface UseBuilderAllTimeShareProps {
  gauge: Address
  rifAddress: Address
}

interface AllTimeShareData {
  amount: string
  isLoading: boolean
  error: Error | null
}

/**
 * This builder's share of every RIF reward the protocol has distributed.
 *
 * Both totals come from state-sync: the denominator from `CycleRewardPerToken` summed across
 * cycles, the numerator from `BuilderRewardsClaimed`, which the subgraph accumulates per claim.
 * Only what the builder has earned but not yet claimed still comes from the gauge contract, since
 * it is not an event yet.
 */
export const useGetBuilderAllTimeShare = ({
  gauge,
  rifAddress,
}: UseBuilderAllTimeShareProps): AllTimeShareData => {
  const {
    data: totalsByToken,
    isLoading: totalsLoading,
    error: totalsError,
  } = useGetTotalRewardsDistributed()

  const { data: claimed, isLoading: claimedLoading, error: claimedError } = useGetBuilderRewardsClaimed(gauge)

  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rifAddress] })

  const amount = useMemo(() => {
    const totalBuilderRewards = getClaimedForToken(claimed, rifAddress) + (claimableRewards ?? 0n)
    const distributedRewards = getTokenTotal(totalsByToken, rifAddress)

    return !distributedRewards ? '0%' : `${(totalBuilderRewards * 100n) / distributedRewards}%`
  }, [claimed, claimableRewards, totalsByToken, rifAddress])

  return {
    amount,
    isLoading: totalsLoading || claimedLoading || claimableRewardsLoading,
    error: totalsError || claimedError || claimableRewardsError,
  }
}
