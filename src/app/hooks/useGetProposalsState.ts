import { ProposalsToState } from '@/app/types'
import { GovernorAbi } from '@/lib/abis/Governor'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { GovernorAddress } from '@/lib/contracts'
import { ProposalState } from '@/shared/types'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetProposalsState = (proposalIds: bigint[]) => {
  const contractCalls = useMemo(
    () =>
      proposalIds.map(proposalId => {
        return {
          address: GovernorAddress as Address,
          abi: GovernorAbi,
          functionName: 'state',
          args: [proposalId],
        } as const
      }),
    [proposalIds],
  )

  const {
    data: states,
    isLoading,
    error,
  } = useReadContracts<ProposalState[]>({
    contracts: contractCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
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
  }, [states, contractCalls])

  return {
    data: proposalsToStates,
    isLoading,
    error,
  }
}
