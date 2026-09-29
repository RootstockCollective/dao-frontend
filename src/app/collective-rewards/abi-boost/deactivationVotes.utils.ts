import { Address, getAddress, isAddress } from 'viem'

import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { BUILDER_ACTION_CATEGORIES, SerializedDecodedData } from '@/app/proposals/shared/utils'
import Big from '@/lib/big'
import { ProposalCategory, ProposalState } from '@/shared/types'

/** A vote only counts as a warning while it can still pass. */
const OPEN_STATES: ReadonlySet<ProposalState> = new Set([ProposalState.Pending, ProposalState.Active])

/** Builders a proposal would take out of the Collective, read from its decoded actions. */
export const getDeactivatedBuilders = (calldatasParsed: SerializedDecodedData[]): Address[] =>
  calldatasParsed.flatMap(action => {
    if (
      action.type !== 'decoded' ||
      BUILDER_ACTION_CATEGORIES.get(action.functionName) !== ProposalCategory.Deactivation
    ) {
      return []
    }
    const [target] = action.args as unknown as readonly unknown[]
    // Not strict: calldata can carry RSK (EIP-1191) checksums, which fail Ethereum's checksum check
    return typeof target === 'string' && isAddress(target, { strict: false }) ? [getAddress(target)] : []
  })

export interface DeactivationVote {
  builder: Address
  proposalId: string
  /** Block at which voting closes. */
  voteEndBlock: bigint
}

type DeactivationProposalInput = Pick<
  ProposalApiResponse,
  'proposalId' | 'calldatasParsed' | 'proposalDeadline'
>

/**
 * Deactivation proposals against one of `backedBuilders` whose voting window hasn't closed yet.
 * This part only needs the proposals list; whether each one is still open (not canceled, not
 * already decided) is then read on-chain, and only for these.
 */
export const getDeactivationVoteCandidates = (
  proposals: DeactivationProposalInput[],
  backedBuilders: ReadonlySet<Address>,
  currentBlock: bigint,
): DeactivationVote[] =>
  proposals.flatMap(({ proposalId, calldatasParsed, proposalDeadline }) => {
    const voteEndBlock = BigInt(Big(proposalDeadline || 0).toFixed(0))
    if (voteEndBlock <= currentBlock) return []
    return getDeactivatedBuilders(calldatasParsed)
      .filter(builder => backedBuilders.has(builder))
      .map(builder => ({ builder, proposalId, voteEndBlock }))
  })

/**
 * The candidates whose vote is still open, given their on-chain states in the same order. When
 * several target the same Builder, the one closing first wins: that's the deadline to beat.
 */
export const pickOpenDeactivationVotes = (
  candidates: DeactivationVote[],
  states: readonly (ProposalState | undefined)[],
): DeactivationVote[] => {
  const earliest = new Map<Address, DeactivationVote>()
  candidates.forEach((candidate, index) => {
    const state = states[index]
    if (state === undefined || !OPEN_STATES.has(state)) return
    const current = earliest.get(candidate.builder)
    if (!current || candidate.voteEndBlock < current.voteEndBlock) {
      earliest.set(candidate.builder, candidate)
    }
  })
  return [...earliest.values()]
}
