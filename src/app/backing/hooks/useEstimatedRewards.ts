import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { getFiatAmount } from '@/app/collective-rewards/utils/getCombinedFiatAmount'
import Big from '@/lib/big'

export function useEstimatedRewards(rewardsData: BuildersRewards[]) {
  if (!rewardsData?.length) {
    return { totalEstimatedRif: 0n, totalEstimatedRbtc: 0n, totalEstimatedUsd: 0 }
  }

  const { totalEstimatedRif, totalEstimatedRbtc, totalEstimatedUsd } = rewardsData.reduce(
    (acc, builder) => {
      const rifAmount = builder.estimatedRewards.rif.amount.value ?? 0n
      const rbtcAmount = builder.estimatedRewards.rbtc.amount.value ?? 0n

      return {
        totalEstimatedRif: acc.totalEstimatedRif + rifAmount,
        totalEstimatedRbtc: acc.totalEstimatedRbtc + rbtcAmount,
        totalEstimatedUsd: acc.totalEstimatedUsd
          .add(getFiatAmount(builder.estimatedRewards.rif.amount))
          .add(getFiatAmount(builder.estimatedRewards.rbtc.amount)),
      }
    },
    { totalEstimatedRif: 0n, totalEstimatedRbtc: 0n, totalEstimatedUsd: Big(0) },
  )

  return {
    totalEstimatedRif,
    totalEstimatedRbtc,
    totalEstimatedUsd: totalEstimatedUsd.toNumber(),
  }
}
