import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils/getCombinedFiatAmount'

export function useEstimatedRewards(rewardsData: BuildersRewards[]) {
  let totalEstimatedRif = 0n
  let totalEstimatedRbtc = 0n
  let totalEstimatedUsd = 0

  if (rewardsData && rewardsData.length > 0) {
    totalEstimatedRif = rewardsData.reduce(
      (acc, builder) => acc + (builder.estimatedRewards.rif.amount.value ?? 0n),
      0n,
    )
    totalEstimatedRbtc = rewardsData.reduce(
      (acc, builder) => acc + (builder.estimatedRewards.rbtc.amount.value ?? 0n),
      0n,
    )
    const allRewardAmounts = rewardsData.flatMap(builder => [
      builder.estimatedRewards.rif.amount,
      builder.estimatedRewards.rbtc.amount,
    ])
    totalEstimatedUsd = getCombinedFiatAmount(allRewardAmounts).toNumber()
  }

  return { totalEstimatedRif, totalEstimatedRbtc, totalEstimatedUsd }
}
