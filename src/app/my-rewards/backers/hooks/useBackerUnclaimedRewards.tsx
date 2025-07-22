import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context'
import { formatRewards } from '../../utils'
import { TOKENS } from '@/lib/tokens'

const useBackerRewardsPerToken = ({ symbol, address }: Token) => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()
  const { prices } = usePricesContext()

  const { earned } = backerRewards[address]
  const totalEarned = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  const price = prices[symbol]?.price ?? 0
  const formatted = formatRewards(totalEarned, price, symbol)

  return {
    ...formatted,
    isLoading,
    error,
  }
}

export const useBackerUnclaimedRewards = () => {
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
