import { Token } from '@/app/collective-rewards/rewards'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context'
import { formatRewards } from '@/app/my-rewards/utils'

const useBackerRewardsPerToken = ({ symbol }: Token, estimatedRewards: bigint) => {
  const { prices } = usePricesContext()

  const price = prices[symbol]?.price ?? 0
  return formatRewards(estimatedRewards, price, symbol)
}

export const useBackersEstimatedRewards = () => {
  const tokens = TOKENS
  const { data: estimatedRewards, isLoading, error } = useGetBuilderEstimatedRewards()
  const { totalEstimatedRif, totalEstimatedRbtc } = estimatedRewards.reduce(
    (acc: { totalEstimatedRif: bigint; totalEstimatedRbtc: bigint }, builder) => {
      return {
        totalEstimatedRif: acc.totalEstimatedRif + builder.backerEstimatedRewards.rif.amount.value,
        totalEstimatedRbtc: acc.totalEstimatedRbtc + builder.backerEstimatedRewards.rbtc.amount.value,
      }
    },
    { totalEstimatedRif: 0n, totalEstimatedRbtc: 0n },
  )

  const rifData = {
    ...useBackerRewardsPerToken(tokens.rif, totalEstimatedRif),
    isLoading,
    error,
  }
  const rbtcData = {
    ...useBackerRewardsPerToken(tokens.rbtc, totalEstimatedRbtc),
    isLoading,
    error,
  }

  return {
    rif: {
      ...rifData,
    },
    rbtc: {
      ...rbtcData,
    },
  }
}
