import moment from 'moment'
import { type Address, type Hash } from 'viem'
import { describe, expect, it } from 'vitest'

import { ProposalCategory } from '@/shared/types'

import {
  type PendingProposal,
  PENDING_PROPOSAL_CLOCK_SKEW_MS,
  reconcilePendingProposals,
} from './usePendingProposals'

const AUTHOR = '0x0000000000000000000000000000000000000001' as Address
const OTHER_AUTHOR = '0x0000000000000000000000000000000000000002' as Address
const TRANSACTION_HASH = `0x${'1'.repeat(64)}` as Hash
const SUBMITTED_AT = 1_750_000_000_000

const createPendingProposal = (overrides: Partial<PendingProposal> = {}): PendingProposal => ({
  transactionHash: TRANSACTION_HASH,
  name: 'Fund a builder',
  proposer: AUTHOR,
  category: ProposalCategory.Grants,
  stage: 'confirming',
  submittedAt: SUBMITTED_AT,
  expiresAt: SUBMITTED_AT + 60 * 60 * 1000,
  chainId: 31,
  ...overrides,
})

describe('reconcilePendingProposals', () => {
  it('removes a syncing proposal after its proposal id reaches the feed', () => {
    const pendingProposal = createPendingProposal({ proposalId: '42', stage: 'syncing' })
    const syncedProposal = {
      proposalId: '42',
      name: 'Different feed name',
      proposer: OTHER_AUTHOR,
      Starts: moment(SUBMITTED_AT),
    }

    expect(reconcilePendingProposals([pendingProposal], [syncedProposal], SUBMITTED_AT)).toEqual([])
  })

  it('matches a confirming proposal by normalized name, author and submission window', () => {
    const pendingProposal = createPendingProposal({ name: '  Fund a Builder  ' })
    const syncedProposal = {
      proposalId: '42',
      name: 'fund a builder',
      proposer: AUTHOR,
      Starts: moment(SUBMITTED_AT - PENDING_PROPOSAL_CLOCK_SKEW_MS),
    }

    expect(reconcilePendingProposals([pendingProposal], [syncedProposal], SUBMITTED_AT)).toEqual([])
  })

  it('keeps an unrelated proposal and removes an expired placeholder', () => {
    const activeProposal = createPendingProposal()
    const expiredProposal = createPendingProposal({
      transactionHash: `0x${'2'.repeat(64)}` as Hash,
      expiresAt: SUBMITTED_AT,
    })
    const unrelatedProposal = {
      proposalId: '42',
      name: activeProposal.name,
      proposer: OTHER_AUTHOR,
      Starts: moment(SUBMITTED_AT),
    }

    expect(
      reconcilePendingProposals([activeProposal, expiredProposal], [unrelatedProposal], SUBMITTED_AT),
    ).toEqual([activeProposal])
  })
})
