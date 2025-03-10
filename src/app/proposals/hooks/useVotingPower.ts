import { GovernorAbi } from '@/lib/abis/Governor'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts, GovernorAddress } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

export const useVotingPower = () => {
  const { address } = useAccount()

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
        functionName: 'decimals',
      },
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'proposalThreshold' },
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
      votingPower: '-',
      canCreateProposal: false,
      threshold: '',
    }
  }

  const [balance, decimals, threshold, totalVotingPower] = data as [bigint, number, bigint, bigint]
  return {
    isLoading: false,
    votingPower: formatUnits(balance, decimals),
    canCreateProposal: totalVotingPower >= threshold,
    threshold: formatUnits(threshold, decimals),
    totalVotingPower: formatUnits(totalVotingPower, decimals),
    delegatedVotingPower: formatUnits(
      totalVotingPower > balance ? totalVotingPower - balance : balance - totalVotingPower,
      decimals,
    ),
  }
}
