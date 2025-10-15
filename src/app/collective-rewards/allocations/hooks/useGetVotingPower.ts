import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { STRIF, TOKENS } from '@/lib/tokens'
import { useAccount, useReadContract } from 'wagmi'
export const useGetVotingPower = () => {
  const { address } = useAccount()
  const { data, isLoading, error } = useReadContract({
    abi: StRIFTokenAbi,
    address: TOKENS[STRIF].address,
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
