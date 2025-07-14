'use client'

import { useCallback, useEffect } from 'react'
import { useReviewProposal } from '../../context/ReviewProposalContext'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { ProposalCategory } from '@/shared/types'
import { Card } from '../components/Card'

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

  // verify that the context has passed correct proposal type
  if (!record?.form || record?.category !== ProposalCategory.Grants)
    throw new Error('GrantsProposalReview: wrong form data')
  const { description, discourseLink, proposalName, targetAddress, token, transferAmount } = record.form
  return (
    <div>
      <h2 className="mb-10 font-kk-topo text-text-100 text-3xl uppercase leading-10 tracking-wide">
        {proposalName}
      </h2>
      <div className="p-6 w-full max-w-[760px] bg-bg-80 rounded-sm flex flex-col gap-6">
        <Card title="Proposal type">
          Transfer of {transferAmount} {token}
        </Card>
        <Card title="Proposal name">{proposalName}</Card>

        <Card title="Discourse link">
          <a className="hover:underline" href={discourseLink} target="_blank">
            {discourseLink}
          </a>
        </Card>
        <Card title="Short description">
          {description.split('\n').map(paragraph => (
            <p>{paragraph}</p>
          ))}
        </Card>

        <Card title="Address to transfer funds to">{targetAddress}</Card>
      </div>
    </div>
  )
}
