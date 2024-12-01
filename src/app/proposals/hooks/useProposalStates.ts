import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { governor } from '@/lib/contracts'
import { type LatestProposalResponse } from './useFetchLatestProposals'

enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

interface Props {
  proposals?: LatestProposalResponse[]
}

/**
 * Get states for array of proposals
 */
export function useProposalStates({ proposals }: Props) {
  // reading votes cast for all proposals
  const { data } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'state',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: bigint }> }

  return (
    useMemo(
      () =>
        data?.map(({ result }) => ({
          proposalState: ProposalState[Number(result)],
        })),
      [data],
    ) ?? []
  )
}
