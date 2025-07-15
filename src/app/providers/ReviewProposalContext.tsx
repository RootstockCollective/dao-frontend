'use client'

import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import { ProposalRecord } from '../proposals/shared/types'
import useLocalStorageState from 'use-local-storage-state'

interface ReviewProposalState {
  record: ProposalRecord | null
  setRecord: (val: ProposalRecord | null) => void
}

const ReviewProposalContext = createContext<ReviewProposalState | null>(null)

export function ReviewProposalProvider({ children }: PropsWithChildren) {
  const [record, setRecord] = useLocalStorageState<ProposalRecord | null>('review-proposal', {
    defaultValue: null,
  })
  const value = useMemo<ReviewProposalState>(
    () => ({
      record,
      setRecord,
    }),
    // eslint-disable-next-line
    [record],
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
