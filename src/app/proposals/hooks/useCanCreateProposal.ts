import { formatUnits } from 'viem'
import { useGovernorParams } from './useGovernorParams'
import { useVotingPower } from './useVotingPower'

export const useCanCreateProposal = () => {
  const { totalVotingPower, isConnected, isLoading } = useVotingPower()
  const { threshold } = useGovernorParams()

  const canCreateProposal = totalVotingPower >= threshold

  return {
    isLoading,
    isConnected,
    canCreateProposal,
    threshold,
    totalVotingPower,
    error: !canCreateProposal
      ? `You need at least ${formatUnits(threshold, 18)} Voting Power to create a proposal. The easiest way to get more Voting Power is to Stake more RIF.`
      : null,
  }
}
