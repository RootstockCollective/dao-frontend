'use client'

import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { useAccount } from 'wagmi'
import { useReviewProposal } from '@/app/providers'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ProposalSubfooter } from '../components/ProposalSubfooter'
import { ProposalCategory } from '@/shared/types'
import { PreviewLabel } from './components/PreviewLabel'
import { useCreateTreasuryTransferProposal } from '@/app/proposals/hooks/useCreateTreasuryTransferProposal'
import { useCreateBuilderWhitelistProposal } from '@/app/proposals/hooks/useCreateBuilderWhitelistProposal'
import { useRemoveBuilderProposal } from '@/app/proposals/hooks/useRemoveBuilderProposal'
import { tokenContracts, uppercasedTokenContracts } from '@/lib/contracts'
import { showToast } from '@/shared/notification'
import { isUserRejectedTxError } from '@/components/ErrorPage'
import { Header, Paragraph } from '@/components/Typography'
import { DISCOURSE_LINK_SEPARATOR, DISPLAY_NAME_SEPARATOR, NO_MILESTONE } from '@/app/proposals/shared/utils'
import { MILESTONE_SEPARATOR, labeledMilestones } from '@/app/proposals/shared/utils'
import { Milestones } from '@/app/proposals/shared/types'
import { ActionDetails } from '@/app/proposals/components/action-details'
import { ActionType, ProposalType } from '@/app/proposals/[id]/types'
import { Description, ProposalDetails } from '@/app/proposals/[id]/components'
import { Category } from '@/app/proposals/components/category'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { GrantProposal } from '../details/schemas/GrantProposalSchema'
import { ActivationProposal } from '../details/schemas/ActivationProposalSchema'
import { DeactivationProposal } from '../details/schemas/DeactivationProposalSchema'
import { usePricesContext } from '@/shared/context'
import { GetPricesResult } from '@/app/user/types'
import { useBuilderContext } from '@/app/collective-rewards/user'

// Transform form data to ParsedActionDetails for all proposal types
const transformFormToActionDetails = (
  form: GrantProposal | ActivationProposal | DeactivationProposal,
  category: ProposalCategory,
  prices: GetPricesResult,
) => {
  switch (category) {
    case ProposalCategory.Grants: {
      const { transferAmount, token, targetAddress } = form as GrantProposal
      return {
        type: ProposalType.WITHDRAW,
        amount: transferAmount,
        tokenSymbol: token,
        toAddress: targetAddress,
        price: prices[token]?.price ?? 0,
      }
    }
    case ProposalCategory.Activation: {
      const { builderAddress } = form as ActivationProposal
      return {
        type: ProposalType.BUILDER_ACTIVATION,
        builder: builderAddress,
      }
    }
    case ProposalCategory.Deactivation: {
      const { builderAddress } = form as DeactivationProposal
      return {
        type: ProposalType.BUILDER_DEACTIVATION,
        builder: builderAddress,
      }
    }
    default:
      return { type: '-', amount: undefined, tokenSymbol: undefined }
  }
}

// Get the correct action name for ProposalDetails component
const getActionName = (category: ProposalCategory) => {
  switch (category) {
    case ProposalCategory.Grants:
      return 'withdraw'
    case ProposalCategory.Activation:
      return 'communityApproveBuilder'
    case ProposalCategory.Deactivation:
      return 'dewhitelistBuilder'
    default:
      return undefined
  }
}

// Get the correct action type for ActionDetails component
const getActionType = (category: ProposalCategory) => {
  switch (category) {
    case ProposalCategory.Grants:
      return ActionType.Transfer
    case ProposalCategory.Activation:
      return ActionType.BuilderApproval
    case ProposalCategory.Deactivation:
      return ActionType.BuilderDeactivation
    default:
      return ActionType.Unknown
  }
}

export default function ProposalReview() {
  const { address, isConnected } = useAccount()
  const { record, waitForTxInBg } = useReviewProposal()
  const { onCreateTreasuryTransferProposal } = useCreateTreasuryTransferProposal()
  const { onCreateBuilderWhitelistProposal } = useCreateBuilderWhitelistProposal()
  const { onRemoveBuilderProposal } = useRemoveBuilderProposal()
  const [loading, setLoading] = useState(false)
  const isDesktop = useIsDesktop()
  const { prices } = usePricesContext()
  const { getBuilderByAddress } = useBuilderContext()

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      if (!record?.form || !record?.category) return

      const { description, proposalName, discourseLink } = record.form
      let txHash: string
      let proposalDescription: string

      switch (record.category) {
        case ProposalCategory.Grants: {
          const { targetAddress, token, transferAmount, milestone } = record.form
          const milestoneString =
            milestone !== Milestones.NO_MILESTONE ? `${MILESTONE_SEPARATOR + milestone} ` : ''
          proposalDescription = `${proposalName};${description} ${DISCOURSE_LINK_SEPARATOR}${discourseLink} ${milestoneString}`
          const tokenAddress = uppercasedTokenContracts[token.toUpperCase() as keyof typeof tokenContracts]
          if (!tokenAddress) throw new Error('Unknown contract address')

          txHash = await onCreateTreasuryTransferProposal(
            targetAddress,
            transferAmount,
            proposalDescription,
            tokenAddress,
          )
          break
        }
        case ProposalCategory.Activation: {
          const { builderAddress, builderName } = record.form
          proposalDescription = `${proposalName}${DISPLAY_NAME_SEPARATOR}${builderName};${description} ${DISCOURSE_LINK_SEPARATOR}${discourseLink} `

          txHash = await onCreateBuilderWhitelistProposal(builderAddress, proposalDescription)
          break
        }
        case ProposalCategory.Deactivation: {
          const { builderAddress } = record.form
          proposalDescription = `${proposalName};${description}`

          txHash = await onRemoveBuilderProposal(builderAddress, proposalDescription)
          break
        }
        default:
          throw new Error('Unknown proposal category')
      }

      const onComplete = () => setLoading(false)
      waitForTxInBg(txHash as `0x${string}`, proposalName, record.category, onComplete)
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
  }, [record, onCreateTreasuryTransferProposal, onCreateBuilderWhitelistProposal, onRemoveBuilderProposal])

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
  if (!record?.form || !record?.category) {
    return null
  }

  const { description, discourseLink, proposalName } = record.form
  const parsedAction = transformFormToActionDetails(record.form, record.category, prices)

  // For activation and deactivation proposals, construct the name with builder name for ProposalDetails component
  // This matches how ProposalView works - the name contains the combined format
  const proposalNameForDetails = (() => {
    if (record.category === ProposalCategory.Activation && 'builderName' in record.form) {
      return `${proposalName}${DISPLAY_NAME_SEPARATOR}${record.form.builderName}`
    }
    if (record.category === ProposalCategory.Deactivation && 'builderAddress' in record.form) {
      const builder = getBuilderByAddress(record.form.builderAddress)
      return builder ? `${proposalName}${DISPLAY_NAME_SEPARATOR}${builder.builderName}` : proposalName
    }
    return proposalName
  })()

  // Handle milestone label for grants proposals
  const milestoneLabel =
    record.category === ProposalCategory.Grants && 'milestone' in record.form
      ? labeledMilestones.find(({ value }) => value === record.form.milestone)?.label
      : undefined

  const category = milestoneLabel ?? record.category

  return (
    <div>
      <div className="md:mt-12 mt-6">
        {!isDesktop ? <PreviewLabel /> : null}
        <div className="lg:flex lg:items-end">
          <div className="flex flex-col md:gap-4 gap-2 items-start md:items-end md:flex-row md:mt-0 mt-6 flex-1 md:mr-6">
            <Header variant="h1" className="md:mt-0 !leading-none">
              {proposalName}
            </Header>
            {category !== NO_MILESTONE ? (
              <div className="flex gap-2 items-center">
                <Category className="mb-0.5" category={category as ProposalCategory} hasGradient />
                <Paragraph variant="body-l" className="text-bg-0 !leading-none whitespace-nowrap">
                  {category}
                </Paragraph>
              </div>
            ) : null}
          </div>
          {isDesktop && <PreviewLabel />}
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-2 md:mt-10 mt-8">
        <div className="flex-1 bg-bg-80 flex flex-col gap-y-6 overflow-hidden rounded-sm md:pt-6">
          <ProposalDetails
            name={proposalNameForDetails}
            description={description}
            proposer={address ?? ''}
            startsAt={moment()}
            parsedAction={parsedAction}
            actionName={getActionName(record.category)}
            link={discourseLink}
            readOnly
          />
          <Description description={description} />
        </div>
        <ActionDetails
          parsedAction={parsedAction}
          actionType={getActionType(record.category)}
          className="md:mt-0"
          readOnly
        />
      </div>
    </div>
  )
}
