import React from 'react'
import { EXPLORER_URL } from '@/lib/constants'
import moment from 'moment'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import Link from 'next/link'
import { showToast } from '@/shared/notification'
import { ProposalCategory } from '@/shared/types'

interface Props {
  timestamp?: number
  proposalName: string
  txHash: string
  proposalCategory: ProposalCategory
}

const longCategoryName = {
  [ProposalCategory.Activation]: 'Builder activation',
  [ProposalCategory.Deactivation]: 'Builder deactivation',
  [ProposalCategory.Grants]: 'Grant',
} as const satisfies Record<ProposalCategory, string>

function ProposalConfirmationModal({ timestamp, proposalName, txHash, proposalCategory }: Props) {
  const explorerLink = `${EXPLORER_URL}/tx/${txHash}`
  const proposalLink = `/proposals/${txHash}`
  const date = moment(timestamp)
  // parse ether
  return (
    <div className="w-full">
      <p className="mb-6">
        {longCategoryName[proposalCategory]} proposal <strong>{proposalName}</strong> was successfully created
        on {date.format('MMMM DD')} at {date.format('h:mm A')}
      </p>
      <div className="w-full flex justify-between items-center gap-2">
        <Link href={explorerLink} target="_blank" rel="noopener noreferrer">
          <div className="flex gap-1 items-center">
            <p className="text-sm font-rootstock-sans font-medium leading-tight text-bg-100 whitespace-nowrap">
              View transaction in Explorer
            </p>
            <ArrowUpRightLightIcon size={20} className="text-bg-100" />
          </div>
        </Link>
        <Link href={proposalLink}>
          <button className="px-4 py-3 rounded-sm leading-normal bg-bg-100 text-text-100 whitespace-nowrap">
            View Proposal
          </button>
        </Link>
      </div>
    </div>
  )
}

export const showProposalTxConfirmedToast = ({ proposalName, timestamp, txHash, proposalCategory }: Props) =>
  showToast({
    position: 'top-center',
    title: 'Proposal created',
    severity: 'success',
    content: (
      <ProposalConfirmationModal
        proposalName={proposalName}
        txHash={txHash}
        timestamp={timestamp}
        proposalCategory={proposalCategory}
      />
    ),
    dismissible: true,
    closeButton: true,
    theme: 'light',
    autoClose: 10000,
    className: '!p-4 !pt-0 !w-full max-w-[688px]',
  })

function ProposalCreationModal({ proposalName, txHash, proposalCategory }: Props) {
  const explorerLink = `${EXPLORER_URL}/tx/${txHash}`
  return (
    <div className="w-full">
      <p className="mb-6">
        {longCategoryName[proposalCategory]} proposal <strong>{proposalName}</strong> has been created.
        Waiting for blockchain confirmation (~30 seconds).
      </p>
      <div className="w-full flex justify-between items-center gap-2">
        <Link href={explorerLink} target="_blank" rel="noopener noreferrer">
          <div className="flex gap-1 items-center">
            <p className="text-sm font-rootstock-sans font-medium leading-tight text-bg-100 whitespace-nowrap">
              View transaction in Explorer
            </p>
            <ArrowUpRightLightIcon size={20} className="text-bg-100" />
          </div>
        </Link>
      </div>
    </div>
  )
}

export const showProposalTxCreatedToast = ({ proposalName, txHash, proposalCategory }: Props) =>
  showToast({
    severity: 'info',
    title: 'Transaction Submitted',
    content: (
      <ProposalCreationModal
        proposalName={proposalName}
        txHash={txHash}
        proposalCategory={proposalCategory}
      />
    ),
    position: 'top-center',
    dismissible: true,
    closeButton: true,
    theme: 'light',
    autoClose: 10000,
    className: '!p-4 !pt-0 !w-full max-w-[688px]',
  })
