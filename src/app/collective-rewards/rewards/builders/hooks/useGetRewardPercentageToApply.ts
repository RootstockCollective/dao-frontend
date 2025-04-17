import { Address } from 'viem'
import { useReadContract, UseReadContractReturnType } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Modify } from '@/shared/utility'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress } from '@/lib/contracts'

export type RewardPercentageToApply = Modify<
  UseReadContractReturnType,
  {
    data?: bigint
  }
>

export const useGetRewardPercentageToApply = (builder: Address): RewardPercentageToApply => {
  const response = useReadContract({
    address: BuilderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'getRewardPercentageToApply',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return {
    ...response,
    data: response.data ? BigInt(response.data) : undefined,
  }
}
