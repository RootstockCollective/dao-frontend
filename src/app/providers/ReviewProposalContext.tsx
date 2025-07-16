'use client'

import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ProposalRecord } from '../proposals/shared/types'
import useLocalStorageState from 'use-local-storage-state'
import { getTxReceipt } from '@/lib/utils'
import { Hash } from 'viem'
import { showCreateProposalToast } from '../proposals/new/review/components/showCreateProposalToast'
import { showToast } from '@/shared/notification'

interface ReviewProposalState {
  record: ProposalRecord | null
  setRecord: (val: ProposalRecord | null) => void
  waitForTxInBg: (proposalTxHash: Hash, proposalName: string) => Promise<void>
}

const ReviewProposalContext = createContext<ReviewProposalState | null>(null)

export function ReviewProposalProvider({ children }: PropsWithChildren) {
  const [record, setRecord] = useLocalStorageState<ProposalRecord | null>('review-proposal', {
    defaultValue: null,
  })

  const waitForTxInBg = useCallback(async (proposalTxHash: Hash, proposalName: string) => {
    showToast({
      severity: 'info',
      title: 'Transaction Submitted',
      content: `Proposal "${proposalName}" has been created. Waiting for blockchain confirmation (~30 seconds).`,
      position: 'top-center',
      dismissible: true,
      closeButton: true,
      theme: 'light',
      autoClose: 5000,
    })
    const receipt = await getTxReceipt(proposalTxHash)
    showCreateProposalToast({
      proposalName,
      timestamp: receipt?.timestamp,
      txHash: proposalTxHash,
    })
  }, [])

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
