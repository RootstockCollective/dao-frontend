import { formatMetrics, FormattedMetrics, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { NativeCurrency, RBTC, RIF, Token, TOKENS, TokenSymbol } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context'

export type FormattedTokenRewardData = FormattedMetrics & {
  isLoading: boolean
  error: Error | null
}

const useBackerRewardsPerToken = ({ symbol, address }: Token | NativeCurrency): FormattedTokenRewardData => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()
  const { prices } = usePricesContext()

  const { earned, claimed } = backerRewards[address]
  const totalEarned = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  const totalClaimed = Object.values(claimed).reduce(
    (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
    0n,
  )

  const total = totalEarned + totalClaimed
  const price = prices[symbol]?.price ?? 0
  const formatted = formatMetrics(total, price, symbol)

  return {
    ...formatted,
    isLoading,
    error,
  }
}

export const useBackerTotalEarned = (): Partial<Record<TokenSymbol, FormattedTokenRewardData>> => {

  const rifData = useBackerRewardsPerToken(TOKENS[RIF])
  const rbtcData = useBackerRewardsPerToken(TOKENS[RBTC])

  return {
    [RIF]: {
      ...rifData,
    },
    [RBTC]: {
      ...rbtcData,
    },
  }
}
