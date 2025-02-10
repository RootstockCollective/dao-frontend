import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { Header, Label, Paragraph, Typography } from '@/components/Typography'
import { formatNumberWithCommas, shortAddress, toFixed, truncateMiddle } from '@/lib/utils'
import { FC, useState } from 'react'
import { FaCopy } from 'react-icons/fa'
import { Address } from 'viem'
import Image from 'next/image'

// Custom question mark icon with tooltip
const QuestionMarkWithTooltip = () => (
  <div className="relative group">
    <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-gray-400 text-sm font-medium hover:border-gray-300 hover:text-gray-300 cursor-help">
      ?
    </div>
    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-[400px]">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg">
        <p className="text-sm text-gray-200 mb-2">
          Your Total Voting Power is the sum of your stake-based voting power and any delegated voting power.
        </p>
        <p className="text-sm">
          It is calculated based on your stake or delegation{' '}
          <span className="text-orange-500">at the time the proposal was created (+1 block)</span>, not at the
          time of voting.
        </p>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-gray-900 border-r border-b border-gray-800 transform rotate-45"></div>
      </div>
    </div>
  </div>
)

export type Vote = 'for' | 'against' | 'abstain'

interface Props {
  onSubmit: (voting: Vote) => void
  onClose: () => void
  proposal: any
  address: Address
  votingPower: string
  isVoting?: boolean
  errorMessage?: string
}

export const VoteProposalModal: FC<Props> = ({
  onClose,
  onSubmit,
  proposal,
  address,
  votingPower,
  isVoting,
  errorMessage,
}) => {
  const [vote, setVoting] = useState<Vote | null>(null)

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (vote) {
      onSubmit(vote)
    }
  }

  return (
    <Modal onClose={onClose} width={756}>
      <div className="px-8 py-6 flex flex-col bg-black">
        <div className="flex justify-between items-center mb-8">
          <Typography className="text-4xl font-bold text-center w-full">VOTING</Typography>
          <button onClick={onClose} className="text-gray-400 hover:text-white absolute right-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <Typography className="text-gray-400">Proposed by</Typography>
            <Typography className="text-orange-500">{shortAddress(proposal.proposer)}</Typography>
          </div>
          <div>
            <Typography className="text-gray-400">Proposal ID</Typography>
            <Typography className="text-orange-500">{truncateMiddle(proposal.proposalId)}</Typography>
          </div>
          <div>
            <Typography className="text-gray-400">Created on:</Typography>
            <Typography className="text-orange-500">{proposal.Starts.format('DD MMM, YYYY')}</Typography>
          </div>
        </div>

        <Label className="text-xl mb-2">Wallet</Label>
        <div className="flex items-center gap-2 p-3 bg-gray-800 rounded mb-6">
          <Image src="/images/metamask.svg" alt="metamask" width={24} height={24} />
          <Typography className="flex-1">{shortAddress(address)}</Typography>
          <button
            onClick={() => navigator.clipboard.writeText(address)}
            className="text-gray-400 hover:text-white"
          >
            <FaCopy size={16} />
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-xl">Total Voting Power</Label>
            <QuestionMarkWithTooltip />
          </div>
          <Typography className="text-6xl text-orange-500 font-normal">
            {formatNumberWithCommas(toFixed(votingPower))}
          </Typography>
        </div>

        <Label className="text-xl mb-2">Vote</Label>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setVoting(vote === 'for' ? null : 'for')}
            className={`p-3 rounded border ${
              vote === 'for'
                ? 'border-white bg-white bg-opacity-10 text-white'
                : 'border-gray-600 text-white hover:border-white'
            }`}
            data-testid="For"
          >
            For
          </button>
          <button
            onClick={() => setVoting(vote === 'against' ? null : 'against')}
            className={`p-3 rounded border ${
              vote === 'against'
                ? 'border-white bg-white bg-opacity-10 text-white'
                : 'border-gray-600 text-white hover:border-white'
            }`}
            data-testid="Against"
          >
            Against
          </button>
          <button
            onClick={() => setVoting(vote === 'abstain' ? null : 'abstain')}
            className={`p-3 rounded border ${
              vote === 'abstain'
                ? 'border-white bg-white bg-opacity-10 text-white'
                : 'border-gray-600 text-white hover:border-white'
            }`}
            data-testid="Abstain"
          >
            Abstain
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded mb-8">Error: {errorMessage}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSubmit}
            disabled={!vote || isVoting}
            className={
              'p-3 rounded bg-gray-400 text-black font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }
          >
            {isVoting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded border border-gray-600 text-white hover:border-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
