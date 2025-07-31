import { usePricesContext } from '@/shared/context'
import { formatRewards } from '../../utils'
import { TOKENS } from '@/lib/tokens'
import { useBackerRewardsContext } from '@/app/context'
import { Token } from '@/app/types'

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
  const formatted = formatRewards(total, price, symbol)

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
