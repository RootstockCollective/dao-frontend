'use client'

import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalRecord } from '../proposals/shared/types'
import useLocalStorageState from 'use-local-storage-state'
import { Hash } from 'viem'
import { ProposalCategory } from '@/shared/types'
import { showToast, updateToast } from '@/shared/notification'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/config'
import { TX_MESSAGES } from '@/shared/txMessages'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'

interface ReviewProposalState {
  record: ProposalRecord | null
  setRecord: (val: ProposalRecord | null) => void
  waitForTxInBg: (proposalTxHash: Hash, proposalName: string, category: ProposalCategory) => Promise<void>
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
  const [record, setRecord] = useLocalStorageState<ProposalRecord | null>('review-proposal', {
    defaultValue: null,
  })

  /**
   * Monitors proposal transaction in background and shows toast notifications.
   * Shows pending toast immediately, waits for confirmation, then shows success toast.
   */
  const waitForTxInBg = useCallback(
    async (proposalTxHash: Hash, _proposalName: string, _proposalCategory: ProposalCategory) => {
      const { success, error, pending } = TX_MESSAGES.proposal

      try {
        // Show pending toast
        showToast({
          ...pending,
          dataTestId: `info-tx-${proposalTxHash}`,
          txHash: proposalTxHash,
          toastId: proposalTxHash,
        })

        // Wait for transaction confirmation
        await waitForTransactionReceipt(config, {
          hash: proposalTxHash,
        })

        // Update to success toast
        updateToast(proposalTxHash, {
          ...success,
          dataTestId: `success-tx-${proposalTxHash}`,
          txHash: proposalTxHash,
          toastId: proposalTxHash,
        })

        // Clear stored record and navigate after success
        setRecord(null)
        router.push('/proposals')
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
      }
    },
    [router, setRecord],
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
