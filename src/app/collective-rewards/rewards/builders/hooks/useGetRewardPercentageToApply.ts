import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract, UseReadContractReturnType } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Modify } from '@/shared/utility'

export type RewardPercentageToApply = Modify<
  UseReadContractReturnType,
  {
    data?: bigint
  }
>

export const useGetRewardPercentageToApply = (builder: Address): RewardPercentageToApply => {
  const response = useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
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
