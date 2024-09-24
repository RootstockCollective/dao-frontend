import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { Header, Paragraph } from '@/components/Typography'
import { FC } from 'react'
import { LuBadgeCheck } from 'react-icons/lu'
import { cn, SHARED_MODAL_BOX_SHADOW_STYLE, truncateMiddle } from '@/lib/utils'

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
        <div className="flex justify-center mt-6">
          <div
            style={{
              boxShadow: SHARED_MODAL_BOX_SHADOW_STYLE,
              padding: 17,
              borderRadius: '30%',
              backgroundColor: 'white',
              width: 80,
            }}
          >
            <LuBadgeCheck size={48} color="var(--color-primary)" />
          </div>
        </div>

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
            <span className="w-2/3 text-sm truncate text-right">{proposal.name}</span>
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
          <Button onClick={onClose}>Return to proposal</Button>
        </div>
      </div>
    </Modal>
  )
}
