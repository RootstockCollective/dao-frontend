import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import { SerializedDecodedData } from '@/app/proposals/shared/utils'
import { ProposalState } from '@/shared/types'

import {
  DeactivationVote,
  getDeactivatedBuilders,
  getDeactivationVoteCandidates,
  pickOpenDeactivationVotes,
} from './deactivationVotes.utils'

const BUILDER_A = getAddress('0x1111111111111111111111111111111111111111')
const BUILDER_B = getAddress('0x2222222222222222222222222222222222222222')

const decoded = (functionName: string, target: string): SerializedDecodedData =>
  ({ type: 'decoded', functionName, args: [target], inputs: [] }) as unknown as SerializedDecodedData

const proposal = (
  proposalId: string,
  calldatasParsed: SerializedDecodedData[],
  proposalDeadline = '1000',
) => ({
  proposalId,
  calldatasParsed,
  proposalDeadline,
})

describe('getDeactivatedBuilders', () => {
  it.each(['communityBanBuilder', 'removeWhitelistedBuilder', 'dewhitelistBuilder', 'revokeBuilderKYC'])(
    'reads the Builder targeted by %s',
    functionName => {
      expect(getDeactivatedBuilders([decoded(functionName, BUILDER_A)])).toEqual([BUILDER_A])
    },
  )

  it('ignores activations, other actions and undecoded calldata', () => {
    expect(
      getDeactivatedBuilders([
        decoded('communityApproveBuilder', BUILDER_A),
        decoded('withdraw', BUILDER_B),
        { type: 'fallback', affectedAddress: BUILDER_B, callData: '0x', value: '0' },
      ]),
    ).toEqual([])
  })

  it('accepts lowercase addresses and RSK checksums', () => {
    const rskChecksummed = '0xEC068F31FA194d9036Ed3C61c3546111Ac3C8902'
    expect(getDeactivatedBuilders([decoded('communityBanBuilder', BUILDER_A.toLowerCase())])).toEqual([
      BUILDER_A,
    ])
    expect(getDeactivatedBuilders([decoded('communityBanBuilder', rskChecksummed)])).toEqual([
      getAddress(rskChecksummed.toLowerCase()),
    ])
  })

  it('skips a target that is not an address', () => {
    expect(getDeactivatedBuilders([decoded('communityBanBuilder', 'not-an-address')])).toEqual([])
  })
})

describe('getDeactivationVoteCandidates', () => {
  const backed = new Set([BUILDER_A])

  it('keeps deactivations of a backed Builder whose window is still open', () => {
    expect(
      getDeactivationVoteCandidates(
        [proposal('1', [decoded('communityBanBuilder', BUILDER_A)])],
        backed,
        900n,
      ),
    ).toEqual([{ builder: BUILDER_A, proposalId: '1', voteEndBlock: 1000n }])
  })

  it('drops Builders the wallet does not back', () => {
    expect(
      getDeactivationVoteCandidates(
        [proposal('1', [decoded('communityBanBuilder', BUILDER_B)])],
        backed,
        900n,
      ),
    ).toEqual([])
  })

  it('drops votes whose window has closed, or with no deadline', () => {
    expect(
      getDeactivationVoteCandidates(
        [
          proposal('1', [decoded('communityBanBuilder', BUILDER_A)], '1000'),
          proposal('2', [decoded('communityBanBuilder', BUILDER_A)], ''),
        ],
        backed,
        1000n,
      ),
    ).toEqual([])
  })
})

describe('pickOpenDeactivationVotes', () => {
  const vote = (proposalId: string, builder = BUILDER_A, voteEndBlock = 1000n): DeactivationVote => ({
    builder,
    proposalId,
    voteEndBlock,
  })

  it('keeps pending and active votes only', () => {
    const candidates = [vote('1'), vote('2', BUILDER_B)]
    expect(pickOpenDeactivationVotes(candidates, [ProposalState.Active, ProposalState.Pending])).toHaveLength(
      2,
    )
  })

  it.each([
    ProposalState.Defeated,
    ProposalState.Succeeded,
    ProposalState.Queued,
    ProposalState.Executed,
    ProposalState.Canceled,
    ProposalState.Expired,
    undefined,
  ])('drops a vote in state %s', state => {
    expect(pickOpenDeactivationVotes([vote('1')], [state])).toEqual([])
  })

  it('keeps the vote that closes first when several target the same Builder', () => {
    const picked = pickOpenDeactivationVotes(
      [vote('late', BUILDER_A, 2_000n), vote('early', BUILDER_A, 1_500n)],
      [ProposalState.Active, ProposalState.Active],
    )
    expect(picked).toEqual([vote('early', BUILDER_A, 1_500n)])
  })
})
