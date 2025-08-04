import { formatMetrics, Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context'
import { TOKENS } from '@/lib/tokens'

const useBackerRewardsPerToken = ({ symbol, address }: Token) => {
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

export const useBackerTotalEarned = () => {
  const { rif, rbtc } = TOKENS

  const rifData = useBackerRewardsPerToken(rif)
  const rbtcData = useBackerRewardsPerToken(rbtc)

  return {
    rif: {
      ...rifData,
    },
    rbtc: {
      ...rbtcData,
    },
  }
}
