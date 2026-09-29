import { Address, getAddress, isAddress } from 'viem'

import { Proposal } from '@/app/proposals/shared/types'
import { DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK } from '@/lib/constants'
import { ProposalState } from '@/shared/types'

/** Governor actions that take a Builder out of the Collective, as decoded from the calldata. */
const DEACTIVATION_FUNCTIONS = new Set([
  'communityBanBuilder',
  'removeWhitelistedBuilder',
  'dewhitelistBuilder',
])

/** A vote only counts as a warning while it can still pass. */
const OPEN_STATES = new Set([ProposalState.Pending, ProposalState.Active])

export interface DeactivationVote {
  builder: Address
  proposalId: string
  /** Block at which voting closes. */
  voteEndBlock: bigint
}

type DeactivationProposalInput = Pick<
  Proposal,
  'proposalId' | 'proposalState' | 'calldatasParsed' | 'proposalDeadline'
>

/**
 * Builders targeted by a deactivation proposal whose vote is still open, keyed by checksummed
 * address. When several proposals target the same Builder, the one closing first wins, since
 * that is the deadline the backer has to beat.
 */
export const getOpenDeactivationVotes = (
  proposals: DeactivationProposalInput[],
): Map<Address, DeactivationVote> =>
  proposals.reduce((votes, { proposalId, proposalState, calldatasParsed, proposalDeadline }) => {
    if (!OPEN_STATES.has(proposalState)) return votes

    const voteEndBlock = BigInt(proposalDeadline.toFixed(0))
    calldatasParsed.forEach(action => {
      if (action.type !== 'decoded' || !DEACTIVATION_FUNCTIONS.has(action.functionName)) return
      const [target] = action.args as unknown as readonly unknown[]
      // Not strict: calldata can carry RSK (EIP-1191) checksums, which fail Ethereum's checksum check
      if (typeof target !== 'string' || !isAddress(target, { strict: false })) return

      const builder = getAddress(target)
      const current = votes.get(builder)
      if (!current || voteEndBlock < current.voteEndBlock) {
        votes.set(builder, { builder, proposalId, voteEndBlock })
      }
    })
    return votes
  }, new Map<Address, DeactivationVote>())

/** Seconds left until the vote closes, estimated from the average block time. */
export const getSecondsUntilVoteEnds = (voteEndBlock: bigint, currentBlock: bigint): number =>
  voteEndBlock > currentBlock ? Number(voteEndBlock - currentBlock) * DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK : 0
