import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon'
import { ExternalLink } from '@/components/Link'
import { Modal } from '@/components/Modal'
import { Label, Paragraph, Span } from '@/components/Typography'
import InfoIcon from '../../review/components/InfoIcon'
import { useModal } from '@/shared/hooks/useModal'

export const MilestoneInfoSidebar = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  return (
    <div className="flex flex-row gap-2">
      <InfoIcon className="w-5 h-5 text-bg-0" />
      <div className="flex flex-col gap-2">
        <Paragraph className="text-bg-0">
          Incremental value unlocks based on Milestone completion paid in $RIF, $rBTC, $USDRIF. After
          discussion with the community off chain and assessment from Delegates you should set your proposed
          Milestone here…
        </Paragraph>

        <Paragraph
          className="flex flex-row gap-2 items-center cursor-pointer"
          onClick={openModal}
          data-testid="LearnMoreLink"
        >
          Learn more <ArrowRightIcon className="w-5 h-5" />
        </Paragraph>
      </div>

      {isModalOpened && <MilestoneModal onClose={closeModal} />}
    </div>
  )
}

const MilestoneModal = ({ onClose }: { onClose: () => void }) => {
  const milestones = [
    {
      title: 'MILESTONE 1',
      description:
        'This is great for testnet projects or for taking the first step towards a mainnet outcome in the future and is typically paid in advance 😅',
    },
    {
      title: 'MILESTONE 2',
      description: (
        <>
          Typically used for <Span bold>mainnet outcomes</Span> if for example your proposal is to go live
          with a dapp or protocol on Rootstock mainnet this is the milestone for you 👌
        </>
      ),
    },
    {
      title: 'MILESTONE 3',
      description: (
        <>
          This is often used for <Span bold>growth</Span> following a mainnet outcome and initial traction,
          this is where your project can really take off and grow on Rootstock 🚀
        </>
      ),
    },
    {
      title: 'NO MILESTONE',
      description: (
        <>
          The Collective appreciates that not all proposals will perfectly fit the milestone criteria and
          after discussion on the community forum you may need to choose the no milestone option. This is used
          less frequently. Please check the{' '}
          <ExternalLink
            className="text-v3-primary"
            href="https://gov.rootstockcollective.xyz/t/general-guidelines-for-grant-applications/94"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="GrantsFrameworkGuidelinesLink"
          >
            <Span>Grants Framework guidelines</Span>
          </ExternalLink>{' '}
          for further details or discuss with a Community Delegate 🙏
        </>
      ),
    },
  ]

  return (
    <Modal onClose={onClose} data-testid="MilestoneModal">
      <div className="flex flex-col gap-2 p-6">
        <div className="flex flex-col gap-10 mt-6">
          {milestones.map(milestone => (
            <div key={milestone.title} className="flex flex-col gap-2">
              <Label variant="tag">{milestone.title}</Label>
              <Paragraph>{milestone.description}</Paragraph>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
