'use client'

import { useCallback, useEffect } from 'react'
import { useReviewProposal } from '../context/ReviewProposalContext'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../components/Subfooter'

export default function ReviewProposal() {
  const { form: savedForm, setForm } = useReviewProposal()

  const onSubmit = useCallback(() => {
    try {
      setForm(null)
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

  if (!savedForm) return <h1 className="text-error text-4xl">Oops!!!</h1>
  return <div>ReviewProposal</div>
}
