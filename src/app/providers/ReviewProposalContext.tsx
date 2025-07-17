'use client'

import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalRecord } from '../proposals/shared/types'
import useLocalStorageState from 'use-local-storage-state'
import { getTxReceipt } from '@/lib/utils'
import { Hash } from 'viem'
import {
  showProposalTxConfirmedToast,
  showProposalTxCreatedToast,
} from '../proposals/new/review/components/proposalToasts'
import { ProposalCategory } from '@/shared/types'

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
   * Shows "created" toast immediately, waits for mining, then shows "confirmed" toast.
   */
  const waitForTxInBg = useCallback(
    async (proposalTxHash: Hash, proposalName: string, proposalCategory: ProposalCategory) => {
      setRecord(null)
      router.push('/proposals')
      showProposalTxCreatedToast({ proposalName, txHash: proposalTxHash, proposalCategory })
      const receipt = await getTxReceipt(proposalTxHash)
      showProposalTxConfirmedToast({
        proposalName,
        timestamp: receipt?.timestamp,
        txHash: proposalTxHash,
        proposalCategory,
      })
    },
    [],
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
