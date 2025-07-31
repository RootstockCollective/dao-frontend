import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
export const useGetVotingPower = () => {
  const { address } = useAccount()
  const { data, isLoading, error } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
  return {
    data,
    isLoading,
    error,
  }
}
