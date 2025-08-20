import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon'
import { Modal } from '@/components/Modal'
import { Label, Paragraph } from '@/components/Typography'
import { useState } from 'react'
import InfoIcon from '../../review/components/InfoIcon'

export const MilestoneInfoSidebar = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-row gap-2">
      <InfoIcon className="w-5 h-5 text-bg-0" />
      <div className="flex flex-col gap-2">
        <Paragraph className="text-bg-0">
          Explain what a milestone is... lorem ipsum dolor sit amet consectetur adipiscing elit nam id purus
          luctus, mollis leo at, ullamcor per risus donec ac tellus tellus ut faucibus a metus id dictum.
        </Paragraph>

        <Paragraph
          className="flex flex-row gap-2 items-center cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Learn more <ArrowRightIcon className="w-5 h-5" />
        </Paragraph>
      </div>

      {showModal && <MilestoneModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

const MilestoneModal = ({ onClose }: { onClose: () => void }) => {
  const milestones = [
    {
      title: 'MILESTONE 1',
      description:
        'Great for testnet projects or taking the first step towards a mainnet outcome in the future. Typically paid in advance.',
    },
    {
      title: 'MILESTONE 2',
      description:
        'If your proposal is to go live with a dApp or protocol on Rootstock mainnet, this is the milestone for you. Typically used for mainnet outcomes.',
    },
    {
      title: 'MILESTONE 3',
      description:
        'This is where your project can really take off and grow on Rootstock. Often used for growth following a mainnet outcome and initial traction.',
    },
    {
      title: 'NO MILESTONE',
      description:
        'Not all proposals will perfectly fit the milestone criteria and after discussion on the community forum you may need to choose the non milestone option. This is used less frequently.',
    },
  ]

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-2 p-6">
        <div className="flex flex-col gap-10 mt-6">
          {milestones.map(milestone => (
            <div key={milestone.title} className="flex flex-col gap-2">
              <Label variant="tag">{milestone.title}</Label>
              <Paragraph>{milestone.description}</Paragraph>
            </div>
          ))}
        </div>
        <Paragraph>Please check the Grants Framework guidelines for further details.</Paragraph>
      </div>
    </Modal>
  )
}
