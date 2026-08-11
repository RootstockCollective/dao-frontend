'use client'

import { waitForTransactionReceipt } from '@wagmi/core'
import { useRouter } from 'next/navigation'
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { Hash, parseEventLogs } from 'viem'
import { useAccount } from 'wagmi'

import { usePendingProposalStorage } from '@/app/proposals/hooks/usePendingProposals'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { config } from '@/config'
import { GovernorAbi } from '@/lib/abis/Governor'
import { showToast, updateToast } from '@/shared/notification'
import { TX_MESSAGES } from '@/shared/txMessages'
import { ProposalCategory } from '@/shared/types'

import { ProposalRecord } from '../proposals/shared/types'

interface ReviewProposalState {
  record: ProposalRecord | null
  setRecord: (val: ProposalRecord | null) => void
  waitForTxInBg: (
    proposalTxHash: Hash,
    proposalName: string,
    category: ProposalCategory,
    onComplete?: () => void,
  ) => Promise<void>
}

const ReviewProposalContext = createContext<ReviewProposalState | null>(null)

/**
 * Provides proposal review state management for multi-step proposal creation.
 *
 * Persists form data in localStorage, handles navigation between steps,
 * and monitors transaction status with background notifications.
 */
export function ReviewProposalProvider({ children }: PropsWithChildren) {
  const router = useRouter()
  const { address } = useAccount()
  const [record, setRecord] = useLocalStorageState<ProposalRecord | null>('review-proposal', {
    defaultValue: null,
  })
  const { addPendingProposal, removePendingProposal } = usePendingProposalStorage()

  /**
   * Monitors proposal transaction in background and shows toast notifications.
   * Shows pending toast immediately, waits for confirmation, then shows success toast.
   */
  const waitForTxInBg = useCallback(
    async (
      proposalTxHash: Hash,
      proposalName: string,
      proposalCategory: ProposalCategory,
      onComplete?: () => void,
    ) => {
      const { success, error, pending } = TX_MESSAGES.proposal

      try {
        // Show pending toast
        showToast({
          ...pending,
          dataTestId: `info-tx-${proposalTxHash}`,
          txHash: proposalTxHash,
          toastId: proposalTxHash,
        })

        if (!address) throw new Error('Unknown proposal author address')

        addPendingProposal({
          transactionHash: proposalTxHash,
          name: proposalName,
          proposer: address,
          category: proposalCategory,
          stage: 'confirming',
        })
        router.push('/proposals')

        // Wait for transaction confirmation
        const receipt = await waitForTransactionReceipt(config, {
          hash: proposalTxHash,
        })

        if (receipt.status === 'reverted') {
          removePendingProposal(proposalTxHash)
          throw new Error('Proposal transaction reverted')
        }

        const [proposalCreatedEvent] = parseEventLogs({
          abi: GovernorAbi,
          logs: receipt.logs,
          eventName: 'ProposalCreated',
        })

        if (!proposalCreatedEvent) {
          console.error('ProposalCreated event missing from confirmed proposal tx', proposalTxHash)
        }

        addPendingProposal({
          transactionHash: proposalTxHash,
          proposalId: proposalCreatedEvent?.args.proposalId.toString(),
          name: proposalName,
          proposer: proposalCreatedEvent?.args.proposer ?? address,
          category: proposalCategory,
          stage: 'syncing',
        })

        // Update to success toast
        updateToast(proposalTxHash, {
          ...success,
          dataTestId: `success-tx-${proposalTxHash}`,
          txHash: proposalTxHash,
          toastId: proposalTxHash,
        })

        // Clear stored form data after success
        setRecord(null)
      } catch (err) {
        if (!isUserRejectedTxError(err)) {
          console.error('Error confirming proposal tx', err)

          // Update to error toast
          updateToast(proposalTxHash, {
            ...error,
            dataTestId: `error-tx-${proposalTxHash}`,
            txHash: proposalTxHash,
            toastId: proposalTxHash,
          })
        }
      } finally {
        onComplete?.()
      }
    },
    [addPendingProposal, address, removePendingProposal, router, setRecord],
  )

  const value = useMemo<ReviewProposalState>(
    () => ({
      record,
      setRecord,
      waitForTxInBg,
    }),
    // eslint-disable-next-line
    [record, waitForTxInBg],
  )
  return <ReviewProposalContext.Provider value={value}>{children}</ReviewProposalContext.Provider>
}

export function useReviewProposal() {
  const context = useContext(ReviewProposalContext)
  if (!context) {
    throw new Error('The hook useReviewProposal should be used with ReviewProposalProvider')
  }
  return context
}
