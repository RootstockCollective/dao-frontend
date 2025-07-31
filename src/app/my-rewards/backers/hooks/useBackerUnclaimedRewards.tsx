import { usePricesContext } from '@/shared/context'
import { formatRewards } from '@/app/my-rewards/utils'
import { TOKENS } from '@/lib/tokens'
import { useBackerRewardsContext } from '@/app/context'
import { Token } from '@/app/types'

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
