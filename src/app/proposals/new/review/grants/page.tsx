'use client'

import { useCallback, useEffect, useState } from 'react'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { ProposalCategory } from '@/shared/types'
import { Card } from '../components/Card'
import { formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { useAccount } from 'wagmi'
import moment from 'moment'
import { TokenIcon } from '@/app/proposals/icons/TokenIcon'
import { PreviewLabel } from '../components/PreviewLabel'
import { useCreateTreasuryTransferProposal } from '@/app/proposals/hooks/useCreateTreasuryTransferProposal'
import { tokenContracts } from '@/lib/contracts'
import { showToast } from '@/shared/notification'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { Header } from '@/components/TypographyNew/Header'

export default function GrantsProposalReview() {
  const { address, isConnected } = useAccount()
  const { record, waitForTxInBg } = useReviewProposal()
  const { onCreateTreasuryTransferProposal } = useCreateTreasuryTransferProposal()
  const [loading, setLoading] = useState(false)

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      if (!record?.form || record?.category !== ProposalCategory.Grants) return
      const { description, proposalName, targetAddress, token, transferAmount } = record.form
      const proposalDescription = `${proposalName};${description}`
      const tokenAddress = tokenContracts[token.toUpperCase() as keyof typeof tokenContracts]
      if (!tokenAddress) throw new Error('GrantsProposalReview: Unknown contract address')
      // Here the user will see Metamask window and confirm his tx
      const txHash = await onCreateTreasuryTransferProposal(
        targetAddress,
        transferAmount,
        proposalDescription,
        tokenAddress,
      )
      const onComplete = () => setLoading(false)
      waitForTxInBg(txHash, proposalName, ProposalCategory.Grants, onComplete)
    } catch (error) {
      if (isUserRejectedTxError(error)) return setLoading(false)
      showToast({
        title: 'Proposal error',
        severity: 'error',
        dismissible: true,
        closeButton: true,
        content: error instanceof Error ? error.message : 'Error publishing proposal',
      })
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, onCreateTreasuryTransferProposal])

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(
      <Subfooter submitForm={onSubmit} buttonText="Publish proposal" disabled={loading || !isConnected} />,
    )
    return () => setSubfooter(null)
  }, [loading, onSubmit, setSubfooter, isConnected])

  // Verify that the context has passed correct proposal type
  if (!record?.form || record?.category !== ProposalCategory.Grants) {
    return null
  }
  const { description, discourseLink, proposalName, targetAddress, token, transferAmount } = record.form
  const tokenAmount = formatNumberWithCommas(transferAmount)
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
              <Card title="Proposal type">
                <span className="mr-2">Transfer of {tokenAmount}</span>
                <span>
                  <TokenIcon token={token} className="w-4 h-4 mb-[2px] mr-1" />
                  {token}
                </span>
              </Card>
              <Card title="Created on">{moment().format('DD MMMM YYYY')}</Card>
              <Card title="Proposed by">{shortAddress(address)}</Card>
              <Card title="Community discussion">
                <a className="hover:underline truncate block" href={discourseLink} target="_blank">
                  {discourseLink}
                </a>
              </Card>
            </div>
            <Header caps variant="h3" className="mb-10 leading-none tracking-tight">
              Description
            </Header>
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
          <Header caps variant="h3" className="mb-4 leading-relaxed tracking-tight">
            Actions
          </Header>
          <div className="grid grid-cols-2 gap-y-4">
            <Card title="Type">Transfer</Card>
            <Card title="To address">{shortAddress(targetAddress)}</Card>
            <Card title="Amount">
              <span className="mr-2">{tokenAmount}</span>
              <span className="whitespace-nowrap">
                <TokenIcon token={token} className="w-4 h-4 mr-1 mb-[2px]" />
                {token}
              </span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
