import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context'
import { formatRewards } from '@/app/my-rewards/utils'
import { TOKENS } from '@/lib/tokens'

const useBackerRewardsPerToken = ({ symbol, address }: Token) => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()
  const { prices } = usePricesContext()

  const { estimated } = backerRewards[address]
  const totalEstimated = Object.values(estimated).reduce((acc, estimated) => acc + estimated, 0n)
  const price = prices[symbol]?.price ?? 0
  const formatted = formatRewards(totalEstimated, price, symbol)

  return {
    ...formatted,
    isLoading,
    error,
  }
}

export const useBackerEstimatedRewards = () => {
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
