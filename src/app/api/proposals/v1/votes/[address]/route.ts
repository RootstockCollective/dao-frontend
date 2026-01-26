import { Address, isAddress } from 'viem'
import { publicClient } from '@/lib/viemPublicClient'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { getProposalsFromBlockscout } from '@/app/proposals/actions/getProposalsFromBlockscout'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { ProposalState } from '@/shared/types'

interface ActiveProposalWithVotingPower {
  proposalId: string
  name: string
  description: string
  votingPower: string
  snapshot: string
  blockNumber: string
  voteStart: string
  voteEnd: string
}

export const revalidate = 60

export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params

    if (!address || !isAddress(address)) {
      return Response.json({ error: 'Invalid address parameter' }, { status: 400 })
    }

    const userAddress = address as Address

    const proposals = await getProposalsFromBlockscout()

    if (proposals.length === 0) {
      return Response.json([])
    }

    const proposalIds = proposals.map(p => BigInt(p.proposalId))

    const stateContracts = proposalIds.map(proposalId => ({
      address: GovernorAddress,
      abi: GovernorAbi,
      functionName: 'state' as const,
      args: [proposalId] as const,
    }))

    const stateResults = await publicClient.multicall({
      contracts: stateContracts,
    })

    const activeProposals: ProposalApiResponse[] = []

    stateResults.forEach((result, index) => {
      if (result.status === 'success' && result.result === ProposalState.Active) {
        activeProposals.push(proposals[index])
      }
    })

    if (activeProposals.length === 0) {
      return Response.json([])
    }

    const activeProposalIds = activeProposals.map(p => BigInt(p.proposalId))

    const snapshotContracts = activeProposalIds.map(proposalId => ({
      address: GovernorAddress,
      abi: GovernorAbi,
      functionName: 'proposalSnapshot' as const,
      args: [proposalId] as const,
    }))

    const snapshotResults = await publicClient.multicall({
      contracts: snapshotContracts,
    })

    const snapshots: bigint[] = []
    for (let i = 0; i < snapshotResults.length; i++) {
      const result = snapshotResults[i]
      if (result.status === 'success' && result.result) {
        snapshots.push(BigInt(String(result.result)))
      } else {
        snapshots.push(0n)
      }
    }

    const votingPowerContracts = snapshots.map(snapshot => ({
      address: GovernorAddress,
      abi: GovernorAbi,
      functionName: 'getVotes' as const,
      args: [userAddress, snapshot] as const,
    }))

    const votingPowerResults = (await publicClient.multicall({
      contracts: votingPowerContracts,
    })) as Array<{ status: 'success' | 'failure'; result?: unknown }>

    const activeProposalsWithVotingPower: ActiveProposalWithVotingPower[] = []

    for (let i = 0; i < activeProposals.length; i++) {
      const proposal = activeProposals[i]
      const votingPowerResult = votingPowerResults[i]
      const snapshot = snapshots[i]

      if (votingPowerResult.status === 'success' && snapshot > 0n && votingPowerResult.result) {
        activeProposalsWithVotingPower.push({
          proposalId: proposal.proposalId,
          name: proposal.name,
          description: proposal.description,
          votingPower: String(votingPowerResult.result),
          snapshot: snapshot.toString(),
          blockNumber: proposal.blockNumber,
          voteStart: proposal.voteStart,
          voteEnd: proposal.voteEnd,
        })
      }
    }

    return Response.json(activeProposalsWithVotingPower)
  } catch (error) {
    console.error('Error in GET /api/proposals/v1/votes/[address]:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
