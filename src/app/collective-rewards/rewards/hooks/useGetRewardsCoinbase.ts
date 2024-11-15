import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetRewardsCoinbase = () => {
  return useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'rewardsCoinbase',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
