import { formatMetrics, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { NativeCurrency, RBTC, RIF, Token, TOKENS, TokenSymbol } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context'
import { FormattedTokenRewardData } from './useBackerTotalEarned'

const useBackerRewardsPerToken = ({ symbol, address }: Token | NativeCurrency): FormattedTokenRewardData => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()
  const { prices } = usePricesContext()

  const { earned } = backerRewards[address]
  const totalEarned = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  const price = prices[symbol]?.price ?? 0
  const formatted = formatMetrics(totalEarned, price, symbol)

  return {
    ...formatted,
    isLoading,
    error,
  }
}

export const useBackerUnclaimedRewards = (): Partial<Record<TokenSymbol, FormattedTokenRewardData>> => {

  return {
    [RIF]: useBackerRewardsPerToken(TOKENS[RIF]),
    [RBTC]: useBackerRewardsPerToken(TOKENS[RBTC]),
  }
}
