'use client'

import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { useAccount } from 'wagmi'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ProposalSubfooter } from '../../components/ProposalSubfooter'
import { ProposalCategory } from '@/shared/types'
import { Card } from '../components/Card'
import { formatCurrencyWithLabel, formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { PreviewLabel } from '../components/PreviewLabel'
import { useCreateTreasuryTransferProposal } from '@/app/proposals/hooks/useCreateTreasuryTransferProposal'
import { tokenContracts, uppercasedTokenContracts } from '@/lib/contracts'
import { showToast } from '@/shared/notification'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { Header, Paragraph, Span } from '@/components/Typography'
import { CopyButton } from '@/components/CopyButton'
import { DISCOURSE_LINK_SEPARATOR } from '@/app/proposals/shared/utils'
import { TokenImage } from '@/components/TokenImage'
import { usePricesContext } from '@/shared/context'
import Big from '@/lib/big'
import { MilestoneIcon } from '@/app/proposals/components/MilestoneIcon'
import { MILESTONE_SEPARATOR, labeledMilestones } from '@/app/proposals/shared/utils'
import { Milestones } from '@/app/proposals/shared/types'

export default function GrantsProposalReview() {
  const { prices } = usePricesContext()

  const { address, isConnected } = useAccount()
  const { record, waitForTxInBg } = useReviewProposal()
  const { onCreateTreasuryTransferProposal } = useCreateTreasuryTransferProposal()
  const [loading, setLoading] = useState(false)

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      if (!record?.form || record?.category !== ProposalCategory.Grants) return
      const { description, proposalName, targetAddress, token, transferAmount, discourseLink, milestone } =
        record.form
      const milestoneString =
        milestone !== Milestones.NO_MILESTONE ? `${MILESTONE_SEPARATOR + milestone} ` : ''
      const proposalDescription = `${proposalName};${description} ${DISCOURSE_LINK_SEPARATOR}${discourseLink} ${milestoneString}`
      const tokenAddress = uppercasedTokenContracts[token.toUpperCase() as keyof typeof tokenContracts]
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
  const { openDrawer, closeDrawer } = useLayoutContext()
  useEffect(() => {
    openDrawer(
      <ProposalSubfooter
        submitForm={onSubmit}
        buttonText="Publish proposal"
        disabled={loading || !isConnected}
      />,
    )
    return () => closeDrawer()
  }, [loading, onSubmit, openDrawer, closeDrawer, isConnected])

  // Verify that the context has passed correct proposal type
  if (!record?.form || record?.category !== ProposalCategory.Grants) {
    return null
  }
  const { description, discourseLink, proposalName, targetAddress, token, transferAmount, milestone } =
    record.form
  const tokenAmount = formatNumberWithCommas(transferAmount)

  const tokenPrice = prices?.[token]?.price ?? 0
  const milestoneLabel = labeledMilestones.find(({ value }) => value === milestone)?.label
  return (
    <div>
      <div className="mb-10 pr-2 w-full lg:flex lg:justify-between">
        <div className="flex items-baseline gap-4">
          <Header caps variant="h3" className="text-2xl lg:text-3xl leading-relaxed tracking-wide">
            {proposalName}
          </Header>
          {milestone !== Milestones.NO_MILESTONE && milestoneLabel && (
            <div className="flex items-baseline-last gap-2">
              <MilestoneIcon milestone={milestone[0] as Milestones} />
              <Paragraph className=" text-lg text-bg-0">{milestoneLabel}</Paragraph>
            </div>
          )}
        </div>
        <PreviewLabel />
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-2">
        <div className="grow-3 max-w-[760px] overflow-hidden">
          <div className="p-6 w-full bg-bg-80 rounded-sm flex flex-col">
            <div className="mb-14 grid grid-cols-2 gap-y-6 gap-x-2">
              <Card title="Proposal type">
                <span className="mr-2">Transfer of {tokenAmount}</span>
                <span>
                  <TokenImage symbol={token} className="inline-block w-4 h-4 mb-[2px] mr-1" />
                  {token}
                </span>
              </Card>
              <Card title="Created on">{moment().format('DD MMMM YYYY')}</Card>
              {address && (
                <Card title="Proposed by">
                  <CopyButton
                    className="justify-start w-fit"
                    copyText={address}
                    successLabel="Address copied"
                  >
                    {shortAddress(address)}
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
          <Header caps variant="h3" className="mb-4 leading-relaxed tracking-tight">
            Actions
          </Header>
          <div className="grid grid-cols-2 gap-y-4">
            <Card title="Type">Transfer</Card>
            <Card title="To address">
              <CopyButton
                className="justify-start w-fit"
                copyText={targetAddress}
                successLabel="Address copied"
              >
                {shortAddress(targetAddress)}
              </CopyButton>
            </Card>
            <Card title="Amount">
              <div className="inline-block">
                <div className="flex items-center">
                  <span className="mr-2">{tokenAmount}</span>
                  <span className="whitespace-nowrap">
                    <TokenImage symbol={token} className="inline-block w-4 h-4 mr-1 mb-[2px]" />
                    {token}
                  </span>
                </div>
                {transferAmount !== undefined && tokenPrice !== undefined && (
                  <div className="text-right">
                    <Span className="text-xs text-white/50 font-normal leading-none">
                      {formatCurrencyWithLabel(Big(transferAmount).times(tokenPrice).toNumber())}
                    </Span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
