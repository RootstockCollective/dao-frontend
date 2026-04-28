import { useAccount, useReadContract } from 'wagmi'

import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'

export const useGetVotingPower = () => {
  const { address } = useAccount()
  const { data, isLoading, error } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'balanceOf',
    args: [address!],
  })
  return {
    data,
    isLoading,
    error,
  }
}
