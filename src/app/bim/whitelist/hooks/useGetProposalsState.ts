import { useReadContracts } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { Address } from 'viem'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useMemo } from 'react'
import { ProposalState } from '@/shared/types'
import { ProposalsToState } from '@/app/bim/types'

export const useGetProposalsState = (proposals: CreateBuilderProposalEventLog[]) => {
  const contractCalls = proposals.map(({ args: { proposalId } }) => {
    return {
      address: GovernorAddress as Address,
      abi: GovernorAbi,
      functionName: 'state',
      args: [proposalId],
    } as const
  })

  const {
    data: states,
    isLoading,
    error,
  } = useReadContracts<ProposalState[]>({
    contracts: contractCalls,
    query: {
      refetchInterval: 30_000,
    },
  })

  const proposalsToStates = useMemo(() => {
    if (!states) {
      return {} as ProposalsToState
    }

    return contractCalls.reduce<ProposalsToState>((acc, contract, index) => {
      const [proposalId] = contract.args
      const state = (states[index].result as ProposalState) || ProposalState.Pending // Fallback to Pending if state is undefined
      acc[proposalId.toString()] = state
      return acc
    }, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states]) // The states dependency is a contract call result, so it's not necessary to include it in the deps array

  return {
    data: proposalsToStates,
    isLoading,
    error,
  }
}
