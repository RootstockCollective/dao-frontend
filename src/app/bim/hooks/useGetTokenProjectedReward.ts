import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address, isAddressEqual } from 'viem'
import { useGetWhitelistedBuildersLength } from '@/app/bim/hooks/useGetWhitelistedBuildersLength'

export const useGetTokenProjectedReward = (rewardToken: Address) => {
  const {
    data: wlBuildersLength,
    isLoading: wlBuildersLengthLoading,
    error: wlBuildersLengthError,
  } = useGetWhitelistedBuildersLength()
  const {
    data: tokens,
    isLoading: tokensLoading,
    error: tokensError,
  } = useGetAddressTokens(SimplifiedRewardDistributorAddress)

  const length = wlBuildersLength ?? 0n

  const addressToken = tokens.find(({ contractAddress }) =>
    isAddressEqual(contractAddress as Address, rewardToken),
  ) || {
    name: '',
    decimals: 18,
    symbol: '',
    balance: '0',
    contractAddress: '',
  }

  const isLoading = wlBuildersLengthLoading || tokensLoading
  const error = wlBuildersLengthError ?? tokensError

  return {
    data: {
      ...addressToken,
      projectedReward: !length ? 0n : BigInt(addressToken.balance) / length,
    },
    isLoading,
    error,
  }
}
