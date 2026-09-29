import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import { SerializedDecodedData } from '@/app/proposals/shared/utils'
import Big from '@/lib/big'
import { ProposalState } from '@/shared/types'

import { getOpenDeactivationVotes, getSecondsUntilVoteEnds } from './deactivationVotes.utils'

const BUILDER_A = '0x1111111111111111111111111111111111111111'
const BUILDER_B = '0x2222222222222222222222222222222222222222'

const decoded = (functionName: string, target: string): SerializedDecodedData =>
  ({ type: 'decoded', functionName, args: [target], inputs: [] }) as unknown as SerializedDecodedData

const proposal = (
  proposalId: string,
  proposalState: ProposalState,
  calldatasParsed: SerializedDecodedData[],
  deadline = 1_000,
) => ({ proposalId, proposalState, calldatasParsed, proposalDeadline: Big(deadline) })

describe('getOpenDeactivationVotes', () => {
  it.each(['communityBanBuilder', 'removeWhitelistedBuilder', 'dewhitelistBuilder'])(
    'picks up %s while the vote is open',
    functionName => {
      const votes = getOpenDeactivationVotes([
        proposal('1', ProposalState.Active, [decoded(functionName, BUILDER_A)]),
      ])
      expect(votes.get(getAddress(BUILDER_A))).toEqual({
        builder: getAddress(BUILDER_A),
        proposalId: '1',
        voteEndBlock: 1_000n,
      })
    },
  )

  it('includes proposals whose vote has not started yet', () => {
    const votes = getOpenDeactivationVotes([
      proposal('1', ProposalState.Pending, [decoded('communityBanBuilder', BUILDER_A)]),
    ])
    expect(votes.has(getAddress(BUILDER_A))).toBe(true)
  })

  it.each([
    ProposalState.Defeated,
    ProposalState.Succeeded,
    ProposalState.Queued,
    ProposalState.Executed,
    ProposalState.Canceled,
    ProposalState.Expired,
  ])('ignores proposals in state %s', state => {
    const votes = getOpenDeactivationVotes([
      proposal('1', state, [decoded('communityBanBuilder', BUILDER_A)]),
    ])
    expect(votes.size).toBe(0)
  })

  it('ignores activations, other actions and undecoded calldata', () => {
    const votes = getOpenDeactivationVotes([
      proposal('1', ProposalState.Active, [
        decoded('communityApproveBuilder', BUILDER_A),
        decoded('withdraw', BUILDER_B),
        { type: 'fallback', affectedAddress: BUILDER_B, callData: '0x', value: '0' },
      ]),
    ])
    expect(votes.size).toBe(0)
  })

  it('matches the Builder regardless of address casing', () => {
    const votes = getOpenDeactivationVotes([
      proposal('1', ProposalState.Active, [
        decoded('communityBanBuilder', BUILDER_A.toUpperCase().replace('0X', '0x')),
      ]),
    ])
    expect(votes.has(getAddress(BUILDER_A))).toBe(true)
  })

  it('accepts addresses carrying an RSK checksum', () => {
    const rskChecksummed = '0xEC068F31FA194d9036Ed3C61c3546111Ac3C8902'
    const votes = getOpenDeactivationVotes([
      proposal('1', ProposalState.Active, [decoded('communityBanBuilder', rskChecksummed)]),
    ])
    expect(votes.has(getAddress(rskChecksummed.toLowerCase()))).toBe(true)
  })

  it('keeps the vote that closes first when several target the same Builder', () => {
    const votes = getOpenDeactivationVotes([
      proposal('late', ProposalState.Active, [decoded('communityBanBuilder', BUILDER_A)], 2_000),
      proposal('early', ProposalState.Active, [decoded('dewhitelistBuilder', BUILDER_A)], 1_500),
    ])
    expect(votes.get(getAddress(BUILDER_A))?.proposalId).toBe('early')
  })
})

describe('getSecondsUntilVoteEnds', () => {
  it('estimates the time left from the average block time', () => {
    expect(getSecondsUntilVoteEnds(1_100n, 1_000n)).toBe(100 * 25)
  })

  it('never goes negative once the vote has closed', () => {
    expect(getSecondsUntilVoteEnds(1_000n, 1_200n)).toBe(0)
  })
})
