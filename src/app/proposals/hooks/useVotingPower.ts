import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useAccount, useReadContracts } from 'wagmi'

export const useVotingPower = () => {
  const { address, isConnected } = useAccount()

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'getVotes',
        args: [address!],
      },
    ],
  })

  if (isLoading || !data) {
    return {
      isLoading,
      votingPower: BigInt(0),
      totalVotingPower: BigInt(0),
      isConnected,
    }
  }

  const [balance, totalVotingPower] = data as [bigint, bigint]

  return {
    isLoading: false,
    votingPower: balance,
    totalVotingPower,
    isConnected,
  }
}
