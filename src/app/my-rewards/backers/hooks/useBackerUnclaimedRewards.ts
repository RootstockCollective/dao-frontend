import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'

const useBackerRewardsPerToken = ({ address }: Token) => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()

  const { earned } = backerRewards[address]
  const totalEarned = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)

  return {
    amount: totalEarned,
    isLoading,
    error,
  }
}

export const useBackerUnclaimedRewards = () => {
  const { rif, rbtc, usdrif } = TOKENS

  const rifAmount = useBackerRewardsPerToken(rif)
  const rbtcAmount = useBackerRewardsPerToken(rbtc)
  const usdrifAmount = useBackerRewardsPerToken(usdrif)

  return {
    rif: rifAmount,
    rbtc: rbtcAmount,
    usdrif: usdrifAmount,
  }
}
