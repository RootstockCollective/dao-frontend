'use client'

import { useEffect } from 'react'
import { useReviewProposal } from '../context/ReviewProposalContext'

export default function ReviewProposal() {
  const { form } = useReviewProposal()
  useEffect(() => {
    if (!form) return
    console.log('🚀 ~ useEffect ~ formData:', form)
  }, [form])

  if (!form) return <h1 className="text-error text-4xl">Oops!!!</h1>
  return <div>ReviewProposal</div>
}
