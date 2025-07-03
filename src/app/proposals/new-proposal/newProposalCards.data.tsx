import { type StaticImageData } from 'next/image'
import grantImage from './images/grant.png'
import rewardsImage from './images/rewards.png'
import grantBigImage from './images/grant-big.png'
import rewardsBigImage from './images/rewards-big.png'

interface NewProposalCardCoreProps {
  cardTitle: string
  textBlock: React.ReactNode
}

export interface NewProposalCardBaseData extends NewProposalCardCoreProps {
  image: StaticImageData
  buttonText: string
  onButtonClick: () => void
}
export interface NewProposalCardExtendedData extends NewProposalCardCoreProps {
  bigImage: StaticImageData
  detailsUrl: string
  bottomTitle: string
  bottomTextBlock: {
    header: string
    text: React.ReactNode
    url: string
  }[]
}

type NewProposalCardData = NewProposalCardBaseData & NewProposalCardExtendedData

export const newProposalCards: NewProposalCardData[] = [
  {
    image: grantImage,
    bigImage: grantBigImage,
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
    bottomTitle: 'Before you apply for a Grant',
    bottomTextBlock: [
      {
        header: 'Align with ecosystem goals',
        text: <>Make sure that your project supports the goals of the Rootstock Ecosystem</>,
        url: '/',
      },
      {
        header: 'Post on Discourse',
        text: <>Share your proposal idea with the community for feedback</>,
        url: '/',
      },
      {
        header: 'Complete KYC',
        text: <>Start your KYC early to avoid delays if your proposal passes the vote</>,
        url: '/',
      },
    ],
    detailsUrl: '/',
  },
  {
    image: rewardsImage,
    bigImage: rewardsBigImage,
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
    bottomTitle: 'Before you create a proposal',
    bottomTextBlock: [
      {
        header: 'Post on Discourse',
        text: <>Create a Join Builders Rewards post off-chain</>,
        url: '/',
      },
      {
        header: 'Complete KYC',
        text: <>Start your KYC early to avoid delays if your proposal passes the vote</>,
        url: '/',
      },
    ],
    detailsUrl: '/',
  },
]
