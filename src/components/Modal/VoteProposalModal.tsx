import { Modal } from '@/components/Modal/Modal'
import { Header, Label, Paragraph, Typography } from '@/components/Typography'
import { formatNumberWithCommas, shortAddress, toFixed, truncateMiddle } from '@/lib/utils'
import { FC, useState } from 'react'
import { FaCopy } from 'react-icons/fa'
import { Address } from 'viem'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

const QuestionMarkWithTooltip = () => (
  <div className="relative group">
    <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-gray-400 text-sm font-medium hover:border-gray-300 hover:text-gray-300 cursor-help">
      ?
    </div>
    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute z-50 bottom-full left-4/5 -translate-x-1/4 mb-2 w-[400px]">
      <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800 shadow-lg">
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

  const baseButtonStyle = 'h-8 py-0 px-0 text-md font-normal w-1/6'
  const baseButtonStyleForActionBtns = 'h-12 py-0 px-0 text-md font-normal w-1/5'
  const voteButtonStyle = cn(baseButtonStyle, 'border border-gray-600 hover:border-white')
  const selectedVoteButtonStyle = cn(baseButtonStyle, 'border border-white bg-white/10')

  return (
    <Modal onClose={onClose} width={756}>
      <div className="p-8 flex flex-col min-h-[600px] bg-black">
        <Typography className="text-5xl font-kk-topo leading-[48px] font-medium text-center w-full mb-12">
          VOTING
        </Typography>

        <div className="flex justify-start space-x-16 items-start mb-12">
          <div>
            <Typography className="text-gray-400 text-base mb-1">Proposed by</Typography>
            <Typography className="text-orange-500 text-base">{shortAddress(proposal.proposer)}</Typography>
          </div>
          <div>
            <Typography className="text-gray-400 text-base mb-1">Proposal ID</Typography>
            <Typography className="text-orange-500 text-base">
              {truncateMiddle(proposal.proposalId)}
            </Typography>
          </div>
          <div>
            <Typography className="text-gray-400 text-base mb-1">Created on:</Typography>
            <Typography className="text-orange-500 text-base">
              {proposal.Starts.format('D MMM, YYYY')}
            </Typography>
          </div>
        </div>

        <div className="mb-12">
          <Typography className="text-xl mb-1 font-medium">Wallet</Typography>
          <div className="flex w-1/3 items-center gap-2 p-3 bg-[#1c1c1c] rounded">
            <Typography className="flex-1 font-mono">{shortAddress(address)}</Typography>
            <button
              onClick={() => navigator.clipboard.writeText(address)}
              className="text-[#2D2D2D] hover:text-white"
            >
              <FaCopy size={16} />
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Typography className="text-xl font-medium">Total Voting Power</Typography>
            <QuestionMarkWithTooltip />
          </div>
          <Typography className="text-[64px] leading-[72px] text-orange-500 font-normal">
            {formatNumberWithCommas(toFixed(votingPower))}
          </Typography>
        </div>

        <div className="flex flex-col flex-grow">
          <Typography className="text-xl font-medium mb-4">Vote</Typography>
          <div className="flex gap-4 mb-16">
            <Button
              variant="secondary"
              onClick={() => setVoting(vote === 'for' ? null : 'for')}
              fullWidth
              className={vote === 'for' ? selectedVoteButtonStyle : voteButtonStyle}
              data-testid="For"
            >
              For
            </Button>
            <Button
              variant="secondary"
              onClick={() => setVoting(vote === 'against' ? null : 'against')}
              fullWidth
              className={vote === 'against' ? selectedVoteButtonStyle : voteButtonStyle}
              data-testid="Against"
            >
              Against
            </Button>
            <Button
              variant="secondary"
              onClick={() => setVoting(vote === 'abstain' ? null : 'abstain')}
              fullWidth
              className={vote === 'abstain' ? selectedVoteButtonStyle : voteButtonStyle}
              data-testid="Abstain"
            >
              Abstain
            </Button>
          </div>

          {errorMessage && (
            <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded mb-8">
              Error: {errorMessage}
            </div>
          )}

          <div className="flex gap-4 mt-auto">
            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={!vote || isVoting}
              fullWidth
              className={cn(
                baseButtonStyleForActionBtns,
                !vote || isVoting
                  ? '!bg-gray-600 !text-gray-400'
                  : '!bg-gray-400 !text-black hover:!bg-gray-300',
              )}
            >
              {isVoting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              fullWidth
              className={cn(baseButtonStyleForActionBtns, '!border !border-gray-600 hover:!border-white')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
