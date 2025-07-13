'use client'

import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import { ProposalRecord } from '../../shared/types'
interface ReviewProposalState {
  record: ProposalRecord | null
  setRecord: (val: ProposalRecord | null) => void
}

const ReviewProposalContext = createContext<ReviewProposalState | null>(null)

export function ReviewProposalProvider({ children }: PropsWithChildren) {
  const [record, setRecord] = useState<ProposalRecord | null>(null)
  const value = useMemo<ReviewProposalState>(
    () => ({
      record,
      setRecord,
    }),
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
