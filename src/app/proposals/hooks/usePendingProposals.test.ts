import moment from 'moment'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { type Address, type Hash } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccount } from 'wagmi'

import { currentEnvChain } from '@/config'
import { ProposalCategory } from '@/shared/types'

import {
  type PendingProposal,
  PENDING_PROPOSAL_CLOCK_SKEW_MS,
  PENDING_PROPOSALS_STORAGE_KEY,
  parsePendingProposals,
  reconcilePendingProposals,
  usePendingProposals,
} from './usePendingProposals'

vi.mock(import('wagmi'), async importOriginal => ({
  ...(await importOriginal()),
  useAccount: vi.fn(),
}))

const AUTHOR = '0x0000000000000000000000000000000000000001' as Address
const OTHER_AUTHOR = '0x0000000000000000000000000000000000000002' as Address
const TRANSACTION_HASH = `0x${'1'.repeat(64)}` as Hash
const SUBMITTED_AT = 1_750_000_000_000
const mockUseAccount = vi.mocked(useAccount)

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

describe('parsePendingProposals', () => {
  it('discards malformed storage entries', () => {
    const validProposal = createPendingProposal()

    expect(
      parsePendingProposals([
        validProposal,
        { ...validProposal, proposer: 'not-an-address' },
        { ...validProposal, name: 42 },
        { ...validProposal, transactionHash: '0x1234' },
      ]),
    ).toEqual([validProposal])
    expect(parsePendingProposals({ proposal: validProposal })).toEqual([])
  })
})

describe('usePendingProposals', () => {
  const activePendingProposal = () =>
    createPendingProposal({
      submittedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
      chainId: currentEnvChain.id,
    })

  beforeEach(() => {
    localStorage.clear()
    mockUseAccount.mockReturnValue({ address: AUTHOR } as never)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('returns only valid proposals for the connected wallet and active chain', () => {
    const visibleProposal = activePendingProposal()
    localStorage.setItem(
      PENDING_PROPOSALS_STORAGE_KEY,
      JSON.stringify([
        visibleProposal,
        { ...visibleProposal, transactionHash: `0x${'2'.repeat(64)}`, chainId: 999 },
        {
          ...visibleProposal,
          transactionHash: `0x${'3'.repeat(64)}`,
          proposer: OTHER_AUTHOR,
        },
        { ...visibleProposal, transactionHash: `0x${'4'.repeat(64)}`, proposer: 'invalid' },
      ]),
    )

    const { result } = renderHook(() => usePendingProposals([]))

    expect(result.current).toEqual([visibleProposal])
  })

  it.each([JSON.stringify({ corrupted: true }), '{not-valid-json'])(
    'recovers safely from a corrupt stored value',
    storedValue => {
      localStorage.setItem(PENDING_PROPOSALS_STORAGE_KEY, storedValue)

      const { result } = renderHook(() => usePendingProposals([]))

      expect(result.current).toEqual([])
    },
  )

  it('persists reconciliation when a pending proposal reaches the feed', async () => {
    const pendingProposal = activePendingProposal()
    localStorage.setItem(PENDING_PROPOSALS_STORAGE_KEY, JSON.stringify([pendingProposal]))

    const syncedProposal = {
      proposalId: '42',
      name: pendingProposal.name,
      proposer: AUTHOR,
      Starts: moment(pendingProposal.submittedAt),
    }
    const { result } = renderHook(() => usePendingProposals([syncedProposal] as never))

    expect(result.current).toEqual([])
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(PENDING_PROPOSALS_STORAGE_KEY) ?? 'null')).toEqual([])
    })
  })

  it('does not write to storage when reconciliation leaves the list unchanged', () => {
    const pendingProposal = activePendingProposal()
    localStorage.setItem(PENDING_PROPOSALS_STORAGE_KEY, JSON.stringify([pendingProposal]))
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    renderHook(() => usePendingProposals([]))

    expect(setItemSpy).not.toHaveBeenCalled()
  })
})
