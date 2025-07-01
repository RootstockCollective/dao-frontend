import { type StaticImageData } from 'next/image'
import grantImage from './images/grant.png'
import rewardsImage from './images/rewards.png'

export interface NewProposalCardData {
  image: StaticImageData
  cardTitle: string
  textBlock: React.ReactNode
  buttonText: string
  onButtonClick: () => void
}

export const newProposalCards: NewProposalCardData[] = [
  {
    image: grantImage,
    cardTitle: 'Grant',
    textBlock: (
      <>
        <p>Community vote to allocate treasury funds for Grants</p>
        <p>
          What&apos;s in it for the user, short explanation&hellip; Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Amet, velit itaque consequatur cupiditate aliquid neque.
        </p>
      </>
    ),
    buttonText: 'Apply for a Grant',
    onButtonClick: () => {},
  },
  {
    image: rewardsImage,
    cardTitle: 'Builders Rewards',
    textBlock: (
      <>
        <p>Community vote to add a Builder, granting access to Rewards</p>
        <p>
          What&apos;s in it for the user, short explanation&hellip; Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Amet, velit itaque consequatur cupiditate aliquid neque.
        </p>
      </>
    ),
    buttonText: 'Create proposal',
    onButtonClick: () => {},
  },
]
