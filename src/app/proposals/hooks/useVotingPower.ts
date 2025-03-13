import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'
import { getCachedProposalSharedDetails } from '@/app/proposals/actions/proposalsAction'
import { useEffect, useState } from 'react'

export const useVotingPower = () => {
  const { address } = useAccount()
  const [proposalDetails, setProposalDetails] =
    useState<Awaited<ReturnType<typeof getCachedProposalSharedDetails>>>()

  useEffect(() => {
    getCachedProposalSharedDetails().then(setProposalDetails)
  }, [])

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
    canCreateProposal: totalVotingPower >= BigInt(proposalThreshold),
    threshold: formatUnits(BigInt(proposalThreshold), stRIFDecimals),
    totalVotingPower: formatUnits(totalVotingPower, stRIFDecimals),
    delegatedVotingPower: formatUnits(
      totalVotingPower > balance ? totalVotingPower - balance : balance - totalVotingPower,
      stRIFDecimals,
    ),
  }
}
