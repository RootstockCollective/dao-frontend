'use client'

import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { useAccount } from 'wagmi'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { ProposalCategory } from '@/shared/types'
import { Card } from '../components/Card'
import { shortAddress } from '@/lib/utils'
import { PreviewLabel } from '../components/PreviewLabel'
import { showToast } from '@/shared/notification'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { useRemoveBuilderProposal } from '@/app/proposals/hooks/useRemoveBuilderProposal'
import { Header, Paragraph } from '@/components/TypographyNew'
import { CopyButton } from '@/components/CopyButton'

export default function DeactivationProposalReview() {
  const { address, isConnected } = useAccount()
  const { record, waitForTxInBg } = useReviewProposal()
  const { onRemoveBuilderProposal } = useRemoveBuilderProposal()
  const [loading, setLoading] = useState(false)

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      if (!record?.form || record?.category !== ProposalCategory.Deactivation) return
      const { proposalName, builderAddress, description } = record.form
      const proposalDescription = `${proposalName};${description}`
      // Here the user will see Metamask window and confirm his tx
      const txHash = await onRemoveBuilderProposal(builderAddress, proposalDescription)
      const onComplete = () => setLoading(false)
      waitForTxInBg(txHash, proposalName, ProposalCategory.Deactivation, onComplete)
    } catch (error) {
      if (isUserRejectedTxError(error)) return setLoading(false)
      showToast({
        title: 'Proposal error',
        severity: 'error',
        dismissible: true,
        closeButton: true,
        content: error instanceof Error ? error.message : 'Error publishing deactivation proposal',
      })
      setLoading(false)
    }
    // eslint-disable-next-line
  }, [record, onRemoveBuilderProposal])

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(
      <Subfooter submitForm={onSubmit} buttonText="Publish proposal" disabled={loading || !isConnected} />,
    )
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter, loading, isConnected])

  // Verify that the context was passed the correct proposal type
  if (!record?.form || record?.category !== ProposalCategory.Deactivation) {
    return null
  }
  const { description, discourseLink, proposalName, builderAddress } = record.form
  return (
    <div>
      <div className="mb-10 pr-2 w-full lg:flex lg:justify-between">
        <Header caps variant="h3" className="text-2xl lg:text-3xl leading-relaxed tracking-wide">
          {proposalName}
        </Header>
        <PreviewLabel />
      </div>
      <div className="w-full flex flex-col lg:flex-row gap-2">
        <div className="grow-3 max-w-[760px] overflow-hidden">
          <div className="p-6 w-full bg-bg-80 rounded-sm flex flex-col">
            <div className="mb-14 grid grid-cols-2 gap-y-6 gap-x-2">
              <Card title="Proposal type">Builder deactivation</Card>
              <Card title="Created on">{moment().format('DD MMMM YYYY')}</Card>
              <Card title="Builder address">{shortAddress(builderAddress)}</Card>
              {address && (
                <Card title="Proposed by">
                  <CopyButton
                    className="justify-start w-fit"
                    copyText={address}
                    successLabel="Address copied"
                  >
                    {shortAddress(address, 5)}
                  </CopyButton>
                </Card>
              )}
              <Card title="Community discussion">
                <a
                  className="hover:underline truncate block"
                  href={discourseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {discourseLink}
                </a>
              </Card>
            </div>
            <Header caps variant="h3" className="mb-10 leading-none tracking-tight">
              Description
            </Header>
            <div className="font-rootstock-sans text-text-100 leading-normal">
              {description.split('\n').map((paragraph, i) => (
                <Paragraph className="mb-8" key={i}>
                  {paragraph}
                </Paragraph>
              ))}
            </div>
          </div>
        </div>
        <div className="grow min-w-[250px] max-w-[760px] p-6 bg-bg-80 rounded-sm overflow-hidden lg:self-start">
          <Header caps className="mb-4 text-xl leading-relaxed tracking-tight">
            Actions
          </Header>
          <div className="grid grid-cols-2 gap-y-4">
            <Card title="Type">Builder deactivation</Card>
            <Card title="Address to de-whitelist">{shortAddress(builderAddress)}</Card>
          </div>
        </div>
      </div>
    </div>
  )
}
