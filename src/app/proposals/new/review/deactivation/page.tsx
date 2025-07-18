'use client'

import { useCallback, useEffect } from 'react'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { ProposalCategory } from '@/shared/types'
import { Card } from '../components/Card'
import { shortAddress } from '@/lib/utils'
import { useAccount } from 'wagmi'
import moment from 'moment'
import { PreviewLabel } from '../components/PreviewLabel'
import { useRouter } from 'next/navigation'
import { showToast } from '@/shared/notification'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { useRemoveBuilderProposal } from '@/app/proposals/hooks/useRemoveBuilderProposal'
import { Typography } from '@/components/TypographyNew/Typography'

export default function DeactivationProposalReview() {
  const router = useRouter()
  const { address } = useAccount()
  const { record, waitForTxInBg } = useReviewProposal()
  const { onRemoveBuilderProposal } = useRemoveBuilderProposal()

  const onSubmit = useCallback(async () => {
    try {
      if (!record?.form || record?.category !== ProposalCategory.Deactivation) return
      const { proposalName, builderAddress, description } = record.form
      const proposalDescription = `${proposalName};${description}`
      // Here the user will see Metamask window and confirm his tx
      const txHash = await onRemoveBuilderProposal(builderAddress, proposalDescription)
      waitForTxInBg(txHash, proposalName, ProposalCategory.Deactivation)
    } catch (error) {
      if (isUserRejectedTxError(error)) return
      showToast({
        title: 'Proposal error',
        severity: 'error',
        dismissible: true,
        closeButton: true,
        content: error instanceof Error ? error.message : 'Error publishing deactivation proposal',
      })
    }
    // eslint-disable-next-line
  }, [record, router])

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Publish proposal" />)
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter])

  // Verify that the context was passed the correct proposal type
  if (!record?.form || record?.category !== ProposalCategory.Deactivation) {
    return null
  }
  const { description, discourseLink, proposalName, builderAddress } = record.form
  return (
    <div>
      <div className="mb-10 pr-2 w-full lg:flex lg:justify-between">
        <Typography variant="h3" className="text-2xl lg:text-3xl uppercase leading-relaxed tracking-wide">
          {proposalName}
        </Typography>
        <PreviewLabel />
      </div>
      <div className="w-full flex flex-col lg:flex-row gap-2">
        <div className="grow-3 max-w-[760px] overflow-hidden">
          <div className="p-6 w-full bg-bg-80 rounded-sm flex flex-col">
            <div className="mb-14 grid grid-cols-2 gap-y-6 gap-x-2">
              <Card title="Proposal type">Builder deactivation</Card>
              <Card title="Created on">{moment().format('DD MMMM YYYY')}</Card>
              <Card title="Builder address">{shortAddress(builderAddress)}</Card>
              <Card title="Proposed by">{shortAddress(address)}</Card>
              <Card title="Community discussion">
                <a className="hover:underline truncate block" href={discourseLink} target="_blank">
                  {discourseLink}
                </a>
              </Card>
            </div>
            <Typography variant="h3" className="mb-10 uppercase leading-none tracking-tight">
              Description
            </Typography>
            <div className="font-rootstock-sans text-text-100 leading-normal">
              {description.split('\n').map((paragraph, i) => (
                <p className="mb-8" key={i}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="grow min-w-[250px] max-w-[760px] p-6 bg-bg-80 rounded-sm overflow-hidden lg:self-start">
          <h3 className="mb-4 text-xl font-kk-topo text-text-100 uppercase leading-relaxed tracking-tight">
            Actions
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <Card title="Type">Builder deactivation</Card>
            <Card title="Address to de-whitelist">{shortAddress(builderAddress)}</Card>
          </div>
        </div>
      </div>
    </div>
  )
}
