import { formatMetrics, FormattedMetrics } from '@/app/collective-rewards/rewards'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { NativeCurrency, RBTC, RIF, Token, TOKENS, TokenSymbol } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context'
import { FormattedTokenRewardData } from './useBackerTotalEarned'

const useBackerRewardsPerToken = ({ symbol }: Token | NativeCurrency, estimatedRewards: bigint): FormattedMetrics => {
  const { prices } = usePricesContext()

  const price = prices[symbol]?.price ?? 0
  return formatMetrics(estimatedRewards, price, symbol)
}

export const useBackersEstimatedRewards = (): Partial<Record<TokenSymbol, FormattedTokenRewardData>> => {

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
    ...useBackerRewardsPerToken(TOKENS[RIF], totalEstimatedRif),
    isLoading,
    error,
  }
  const rbtcData = { ...useBackerRewardsPerToken(TOKENS[RBTC], totalEstimatedRbtc), isLoading, error }

  return { [RIF]: { ...rifData }, [RBTC]: { ...rbtcData } }
}
