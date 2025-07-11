'use client'

import { createContext, useContext, useMemo, useState } from 'react'

interface ReviewProposalState {
  form: unknown
  setForm: (val: unknown) => void
}

const ReviewProposalContext = createContext<ReviewProposalState | null>(null)

export function ReviewProposalProvider({ children }: React.PropsWithChildren) {
  const [form, setForm] = useState<unknown>(null)
  const value = useMemo<ReviewProposalState>(
    () => ({
      form,
      setForm,
    }),
    [form],
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
