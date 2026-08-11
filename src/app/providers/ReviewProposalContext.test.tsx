import { waitForTransactionReceipt } from '@wagmi/core'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import useLocalStorageState from 'use-local-storage-state'
import { type Address, type Hash, parseEventLogs } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccount } from 'wagmi'

import { usePendingProposalStorage } from '@/app/proposals/hooks/usePendingProposals'
import { showToast, updateToast } from '@/shared/notification'
import { ProposalCategory } from '@/shared/types'

import { ReviewProposalProvider, useReviewProposal } from './ReviewProposalContext'

vi.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('use-local-storage-state', () => ({
  default: vi.fn(),
}))

vi.mock(import('viem'), async importOriginal => ({
  ...(await importOriginal()),
  parseEventLogs: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('@/app/proposals/hooks/usePendingProposals', () => ({
  usePendingProposalStorage: vi.fn(),
}))

vi.mock('@/config', () => ({
  config: {},
}))

vi.mock('@/shared/notification', () => ({
  showToast: vi.fn(),
  updateToast: vi.fn(),
}))

const AUTHOR = '0x0000000000000000000000000000000000000001' as Address
const TRANSACTION_HASH = `0x${'1'.repeat(64)}` as Hash
const PROPOSAL_NAME = 'Fund a builder'
const PROPOSAL_ID = 42n
const SUCCESS_RECEIPT = {
  status: 'success',
  logs: [],
} as unknown as Awaited<ReturnType<typeof waitForTransactionReceipt>>
const PROPOSAL_CREATED_EVENT = {
  args: {
    proposalId: PROPOSAL_ID,
    proposer: AUTHOR,
  },
}

const mockWaitForTransactionReceipt = vi.mocked(waitForTransactionReceipt)
const mockUseRouter = vi.mocked(useRouter)
const mockUseLocalStorageState = vi.mocked(useLocalStorageState)
const mockParseEventLogs = vi.mocked(parseEventLogs)
const mockUseAccount = vi.mocked(useAccount)
const mockUsePendingProposalStorage = vi.mocked(usePendingProposalStorage)
const mockShowToast = vi.mocked(showToast)
const mockUpdateToast = vi.mocked(updateToast)

const mockPush = vi.fn()
const mockSetRecord = vi.fn()
const mockAddPendingProposal = vi.fn()
const mockRemovePendingProposal = vi.fn()
const mockOnComplete = vi.fn()

function TestConsumer() {
  const { waitForTxInBg } = useReviewProposal()

  return (
    <button
      onClick={() =>
        void waitForTxInBg(
          TRANSACTION_HASH,
          PROPOSAL_NAME,
          ProposalCategory.Grants,
          mockOnComplete,
        )
      }
    >
      Publish
    </button>
  )
}

const renderProvider = () =>
  render(
    <ReviewProposalProvider>
      <TestConsumer />
    </ReviewProposalProvider>,
  )

describe('ReviewProposalProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockUseRouter.mockReturnValue({ push: mockPush } as never)
    mockUseAccount.mockReturnValue({ address: AUTHOR } as never)
    mockUseLocalStorageState.mockReturnValue([
      null,
      mockSetRecord,
      { isPersistent: true, removeItem: vi.fn() },
    ] as never)
    mockUsePendingProposalStorage.mockReturnValue({
      storedPendingProposals: [],
      setStoredPendingProposals: vi.fn(),
      addPendingProposal: mockAddPendingProposal,
      removePendingProposal: mockRemovePendingProposal,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('clears the submitted draft before navigating and does not clear it again after confirmation', async () => {
    let resolveReceipt!: (receipt: Awaited<ReturnType<typeof waitForTransactionReceipt>>) => void
    const receiptPromise = new Promise<Awaited<ReturnType<typeof waitForTransactionReceipt>>>(resolve => {
      resolveReceipt = resolve
    })
    mockWaitForTransactionReceipt.mockReturnValue(receiptPromise)
    mockParseEventLogs.mockReturnValue([PROPOSAL_CREATED_EVENT] as never)

    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(mockSetRecord).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/proposals')
    })
    expect(mockSetRecord).toHaveBeenCalledWith(null)
    expect(mockSetRecord.mock.invocationCallOrder[0]).toBeLessThan(mockPush.mock.invocationCallOrder[0])

    resolveReceipt(SUCCESS_RECEIPT)

    await waitFor(() => {
      expect(mockAddPendingProposal).toHaveBeenCalledTimes(2)
      expect(mockOnComplete).toHaveBeenCalledOnce()
    })
    expect(mockSetRecord).toHaveBeenCalledOnce()
    expect(mockAddPendingProposal).toHaveBeenNthCalledWith(2, {
      transactionHash: TRANSACTION_HASH,
      proposalId: PROPOSAL_ID.toString(),
      name: PROPOSAL_NAME,
      proposer: AUTHOR,
      category: ProposalCategory.Grants,
      stage: 'syncing',
    })
    expect(mockRemovePendingProposal).not.toHaveBeenCalled()
    expect(mockUpdateToast).toHaveBeenCalledWith(
      TRANSACTION_HASH,
      expect.objectContaining({ dataTestId: `success-tx-${TRANSACTION_HASH}` }),
    )
  })

  it('removes the confirming placeholder when receipt confirmation fails', async () => {
    const confirmationError = new Error('Proposal transaction reverted')
    mockWaitForTransactionReceipt.mockRejectedValue(confirmationError)

    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(mockRemovePendingProposal).toHaveBeenCalledWith(TRANSACTION_HASH)
    })
    expect(mockAddPendingProposal).toHaveBeenCalledOnce()
    expect(mockParseEventLogs).not.toHaveBeenCalled()
    expect(mockUpdateToast).toHaveBeenCalledWith(
      TRANSACTION_HASH,
      expect.objectContaining({ dataTestId: `error-tx-${TRANSACTION_HASH}` }),
    )
    expect(mockOnComplete).toHaveBeenCalledOnce()
  })

  it('treats a confirmed replacement without ProposalCreated as an error', async () => {
    mockWaitForTransactionReceipt.mockResolvedValue(SUCCESS_RECEIPT)
    mockParseEventLogs.mockReturnValue([])

    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(mockRemovePendingProposal).toHaveBeenCalledWith(TRANSACTION_HASH)
    })
    expect(mockAddPendingProposal).toHaveBeenCalledOnce()
    expect(mockUpdateToast).toHaveBeenCalledTimes(1)
    expect(mockUpdateToast).toHaveBeenCalledWith(
      TRANSACTION_HASH,
      expect.objectContaining({ dataTestId: `error-tx-${TRANSACTION_HASH}` }),
    )
    expect(mockOnComplete).toHaveBeenCalledOnce()
  })

  it('shows the pending notification before waiting for the receipt', async () => {
    mockWaitForTransactionReceipt.mockRejectedValue(new Error('RPC unavailable'))

    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledOnce()
    })
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ dataTestId: `info-tx-${TRANSACTION_HASH}` }),
    )
  })
})
