import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { ReadContractReturnType } from 'viem/actions'
import { useReadContract, UseReadContractReturnType } from 'wagmi'

export const useGetRewardsERC20 = () => {
  return useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'rewardsERC20',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
