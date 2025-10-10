'use client'

import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { useAccount } from 'wagmi'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ProposalSubfooter } from '../../components/ProposalSubfooter'
import { ProposalCategory } from '@/shared/types'
import { PreviewLabel } from '../components/PreviewLabel'
import { useCreateTreasuryTransferProposal } from '@/app/proposals/hooks/useCreateTreasuryTransferProposal'
import { tokenContracts, uppercasedTokenContracts } from '@/lib/contracts'
import { showToast } from '@/shared/notification'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { Header, Paragraph, Span } from '@/components/Typography'
import { DISCOURSE_LINK_SEPARATOR } from '@/app/proposals/shared/utils'
import { MILESTONE_SEPARATOR, labeledMilestones } from '@/app/proposals/shared/utils'
import { Milestones } from '@/app/proposals/shared/types'
import { ActionDetails } from '@/app/proposals/components/action-details'
import { ActionType, ProposalType } from '@/app/proposals/[id]/types'
import { Description, ProposalDetails } from '@/app/proposals/[id]/components'
import { Category } from '@/app/proposals/components/category'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export default function GrantsProposalReview() {
  const { address, isConnected } = useAccount()
  const { record, waitForTxInBg } = useReviewProposal()
  const { onCreateTreasuryTransferProposal } = useCreateTreasuryTransferProposal()
  const [loading, setLoading] = useState(false)
  const isDesktop = useIsDesktop()
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

  const milestoneLabel = labeledMilestones.find(({ value }) => value === milestone)?.label

  const category = milestoneLabel ?? ProposalCategory.Grants

  const action = {
    type: ProposalType.WITHDRAW,
    amount: transferAmount,
    tokenSymbol: token,
    toAddress: targetAddress,
  }
  return (
    <div>
      <div className="md:flex items-center gap-4 md:mt-12 mt-6">
        {!isDesktop ? <PreviewLabel /> : null}
        <Header variant="h1" className="md:mt-0 mt-6">
          {proposalName}
        </Header>
        <div className="flex gap-2 items-end md:mt-0 mt-3">
          <Category className="mb-0.5" category={category} hasGradient />
          <Paragraph variant="body-l" className="text-bg-0 !leading-none whitespace-nowrap">
            {category}
          </Paragraph>
        </div>
        {isDesktop ? <PreviewLabel /> : null}
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-2 md:mt-10 mt-8">
        <div className="flex-1 bg-bg-80 md:p-6 p-4 pt-0 flex flex-col gap-y-6 overflow-hidden">
          <ProposalDetails
            name={proposalName}
            description={description}
            proposer={address ?? ''}
            startsAt={moment()}
            parsedAction={action}
            actionName={'withdraw'}
            link={discourseLink}
            readOnly
          />
          <Description description={description} />
        </div>
        <ActionDetails
          parsedAction={action}
          actionType={ActionType.Transfer}
          className="md:mt-0 md:max-h-[214px]"
        />
      </div>
    </div>
  )
}
