import { getCachedProposalSharedDetails } from '@/app/proposals/actions/proposalsAction'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { STRIF, TOKENS } from '@/lib/tokens'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

export const useVotingPower = () => {
  const { address } = useAccount()
  const { data: proposalDetails, isLoading: isProposalsDetailsLoading } = useQuery({
    queryFn: getCachedProposalSharedDetails,
    queryKey: ['cachedProposalsSharedDetails'],
  })

  const { data, isLoading: isLoadingVotes } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: TOKENS[STRIF].address,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        abi: StRIFTokenAbi,
        address: TOKENS[STRIF].address,
        functionName: 'getVotes',
        args: [address!],
      },
    ],
  })
  const isLoading = isProposalsDetailsLoading || isLoadingVotes
  if (isLoading || !data || !proposalDetails) {
    return {
      isLoading,
      votingPower: '-',
      canCreateProposal: false,
      threshold: '',
    }
  }

  const [balance, totalVotingPower] = data as [bigint, bigint]
  const { proposalThreshold, stRIFDecimals } = proposalDetails
  return {
    isLoading: false,
    votingPower: formatUnits(balance, stRIFDecimals),
    votingPowerRaw: balance,
    canCreateProposal: totalVotingPower >= BigInt(proposalThreshold),
    threshold: formatUnits(BigInt(proposalThreshold), stRIFDecimals),
    totalVotingPower: formatUnits(totalVotingPower, stRIFDecimals),
    delegatedVotingPower: formatUnits(
      totalVotingPower > balance ? totalVotingPower - balance : 0n,
      stRIFDecimals,
    ),
  }
}
