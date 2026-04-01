import { Token } from '@/app/collective-rewards/rewards'
import { TOKENS } from '@/lib/tokens'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'

interface UseBuilderUnclaimedRewardsProps {
  builder: Address
  gauge: Address
}

interface UnclaimedRewardsData {
  rif: bigint
  rbtc: bigint
  usdrif: bigint
  isLoading: boolean
  error: Error | null
}

const useGetBuilderRewardsPerToken = (gauge: Address, token: Token) => {
  const {
    data: rewards,
    isLoading: isLoading,
    error: error,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [token.address] })

  return {
    amount: rewards ?? 0n,
    isLoading,
    error,
  }
}

export const useGetBuilderUnclaimedRewards = ({
  gauge,
}: UseBuilderUnclaimedRewardsProps): UnclaimedRewardsData => {
  const { rif, rbtc, usdrif } = TOKENS

  const {
    amount: rifAmount,
    isLoading: rifIsLoading,
    error: rifError,
  } = useGetBuilderRewardsPerToken(gauge, rif)
  const {
    amount: rbtcAmount,
    isLoading: rbtcIsLoading,
    error: rbtcError,
  } = useGetBuilderRewardsPerToken(gauge, rbtc)
  const {
    amount: usdrifAmount,
    isLoading: usdrifIsLoading,
    error: usdrifError,
  } = useGetBuilderRewardsPerToken(gauge, usdrif)

  return {
    rif: rifAmount,
    rbtc: rbtcAmount,
    usdrif: usdrifAmount,
    isLoading: rifIsLoading || rbtcIsLoading || usdrifIsLoading,
    error: rifError || rbtcError || usdrifError,
  }
}
