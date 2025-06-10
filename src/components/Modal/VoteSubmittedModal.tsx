import { splitCombinedName } from '@/app/proposals/shared/utils'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { Header, Paragraph } from '@/components/Typography'
import { cn, truncateMiddle } from '@/lib/utils'
import { FC } from 'react'

export type Vote = 'for' | 'against' | 'abstain'

interface Props {
  onClose: () => void
  proposal: any
  vote: Vote
}

export const VoteSubmittedModal: FC<Props> = ({ onClose, proposal, vote }) => {
  const colorsMap = {
    for: 'text-st-success',
    against: 'text-st-error',
    abstain: 'text-gray-400',
  }
  return (
    <Modal onClose={onClose}>
      <div className="px-[50px] pt-[21px] pb-[42px] flex justify-center flex-col">
        <Header variant="h1" className="font-semibold text-center mt-6">
          VOTE SUBMITTED
        </Header>
        <Paragraph variant="light" className="text-[14px] text-center mt-4">
          Your vote has been submitted successfully! Thank you for <br /> participating in the decision-making
          process.
        </Paragraph>
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="w-1/3 text-sm">Proposal</span>
            <span className="w-2/3 text-sm truncate text-right">
              {splitCombinedName(proposal.name).proposalName}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="w-1/3 text-sm">Proposal ID</span>
            <span className="w-2/3 text-sm text-right">{truncateMiddle(proposal.proposalId)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="w-1/3 text-sm">Vote</span>
            <span className={cn('w-2/3 text-sm capitalize text-right', colorsMap[vote])}>{vote}</span>
          </div>
        </div>

        <div className="w-full flex justify-center mt-8">
          <Button onClick={onClose} data-testid="ReturnToProposal">
            Return to proposal
          </Button>
        </div>
      </div>
    </Modal>
  )
}
