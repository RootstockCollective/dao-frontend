import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { Header, Paragraph } from '@/components/Typography'
import { FC } from 'react'

export type Vote = 'for' | 'against' | 'abstain'

interface Props {
  onClose: () => void
  proposal: any
  vote: Vote
}

export const VoteSubmittedModal: FC<Props> = ({ onClose, proposal, vote }) => (
  <Modal onClose={onClose}>
    <div className="px-[50px] pt-[21px] pb-[42px] flex justify-center flex-col">
      <Header variant="h1" className="font-semibold text-center mt-6">
        Vote submitted
      </Header>
      <Paragraph variant="light" className="text-[14px] text-center mt-4">
        Your vote has been submitted successfully! Thank you for participating <br />
        in the decision-making process.
      </Paragraph>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <span className="w-1/3 text-sm">Proposal</span>
          <span className="w-2/3 text-sm truncate">{proposal.title}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Proposal ID</span>
          <span className="text-sm">{proposal.id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Vote</span>
          <span className="text-sm capitalize">{vote}</span>
        </div>
      </div>

      <div className="w-full flex justify-center mt-8">
        <Button onClick={onClose}>Return to proposal</Button>
      </div>
    </div>
  </Modal>
)
