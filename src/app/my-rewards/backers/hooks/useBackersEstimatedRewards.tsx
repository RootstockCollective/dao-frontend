import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context'
import { formatRewards } from '../../utils'
import { getTokens } from '@/lib/tokens'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { BuilderEstimatedRewards } from '@/app/collective-rewards/types'

const useBackerRewardsPerToken = ({ symbol }: Token, estimatedRewards: bigint) => {
  const { prices } = usePricesContext()

  const price = prices[symbol]?.price ?? 0
  return formatRewards(estimatedRewards, price, symbol)
}

export const useBackersEstimatedRewards = () => {
  const tokens = getTokens()
  const { data: estimatedRewards, isLoading, error } = useGetBuilderEstimatedRewards(tokens)
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
