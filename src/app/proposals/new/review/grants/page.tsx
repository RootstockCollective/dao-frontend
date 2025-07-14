'use client'

import { type ElementType, useCallback, useEffect } from 'react'
import { useReviewProposal } from '../../context/ReviewProposalContext'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { ProposalCategory } from '@/shared/types'

export default function GrantsProposalReview() {
  const { record, setRecord } = useReviewProposal()

  const onSubmit = useCallback(() => {
    try {
      setRecord(null)
    } catch (error) {
      //
    }
  }, [])

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Publish proposal" />)
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter])
  return <div>GrantsProposalReview</div>
}
