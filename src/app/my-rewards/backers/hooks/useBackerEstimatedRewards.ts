import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'

const useBackerRewardsPerToken = ({ address }: Token) => {
  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()

  const { estimated } = backerRewards[address]
  const totalEstimated = Object.values(estimated).reduce((acc, estimated) => acc + estimated, 0n)

  return {
    amount: totalEstimated,
    isLoading,
    error,
  }
}

export const useBackerEstimatedRewards = () => {
  const { rif, rbtc, usdrif } = TOKENS

  const rifData = useBackerRewardsPerToken(rif)
  const rbtcData = useBackerRewardsPerToken(rbtc)
  const usdrifData = useBackerRewardsPerToken(usdrif)

  return {
    rif: rifData,
    rbtc: rbtcData,
    usdrif: usdrifData,
  }
}
