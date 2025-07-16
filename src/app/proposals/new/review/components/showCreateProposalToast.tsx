import React from 'react'
import { EXPLORER_URL } from '@/lib/constants'
import moment from 'moment'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import Link from 'next/link'
import { showToast } from '@/shared/notification'

interface Props {
  timestamp?: number
  proposalName: string
  txHash: string
}

function SuccessModal({ timestamp, proposalName, txHash }: Props) {
  const explorerLink = `${EXPLORER_URL}/tx/${txHash}`
  const proposalLink = `/proposals/${txHash}`
  const date = moment(timestamp)
  return (
    <div className="w-full">
      <p className="mb-6">
        Grant Proposal <strong>{proposalName}</strong> was successfully created on {date.format('MMMM DD')} at{' '}
        {date.format('h:mm A')}
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

export const showCreateProposalToast = ({ proposalName, timestamp, txHash }: Props) =>
  showToast({
    position: 'top-center',
    title: 'Proposal created',
    severity: 'success',
    content: <SuccessModal proposalName={proposalName} txHash={txHash} timestamp={timestamp} />,
    dismissible: true,
    closeButton: true,
    theme: 'light',
    autoClose: 5000,
    className: '!p-4 !pt-0 !w-full max-w-[688px]',
  })
