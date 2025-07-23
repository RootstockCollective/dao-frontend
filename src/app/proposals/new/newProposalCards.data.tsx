import { type StaticImageData } from 'next/image'
import grantImage from './images/grant.png'
import rewardsImage from './images/rewards.png'
import grantBigImage from './images/grant-big.png'
import rewardsBigImage from './images/rewards-big.png'
import { ProposalCategory } from '@/shared/types'

interface NewProposalCardCoreProps {
  type: ProposalCategory
  cardTitle: string
  textBlock: React.ReactNode
}

export interface NewProposalCardBaseData extends NewProposalCardCoreProps {
  image: StaticImageData
  buttonText: string
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
    type: ProposalCategory.Grants,
    image: grantImage,
    bigImage: grantBigImage,
    cardTitle: 'Grant',
    textBlock: (
      <>
        <p>
          Community backed - your proposal is voted on inside the DAO, aligning funding with ecosystem
          priorities.
        </p>
        <p>
          When you pass through community voting your funding is unlocked as you achieve your milestones!
          Receive funding as you deliver on clear, measurable goals - all with full transparency and community
          oversight at every stage.
        </p>
      </>
    ),
    buttonText: 'Apply for a Grant',
    bottomTitle: 'Before you apply for a Grant',
    bottomTextBlock: [
      {
        header: 'Align with ecosystem goals',
        text: <>Make sure that your project supports the goals of the Rootstock Ecosystem</>,
        url: 'https://rootstockcollective.xyz/submitting-a-grant-proposal/',
      },
      {
        header: 'Complete KYC',
        text: <>Start your KYC early to avoid delays if your proposal passes the vote</>,
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      },
      {
        header: 'Post on Discourse',
        text: <>Share your proposal idea with the community for feedback</>,
        url: 'https://gov.rootstockcollective.xyz/c/grants/5',
      },
    ],
    detailsUrl: '/proposals/new/details/grants',
  },
  {
    type: ProposalCategory.Activation,
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
    bottomTitle: 'Before you create a proposal',
    bottomTextBlock: [
      {
        header: 'Post on Discourse',
        text: <>Create a Join Builders Rewards post off-chain</>,
        url: 'https://gov.rootstockcollective.xyz/c/collective-rewards/7',
      },
      {
        header: 'Complete KYC',
        text: <>Start your KYC early to avoid delays if your proposal passes the vote</>,
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      },
    ],
    detailsUrl: '/proposals/new/details/activation',
  },
]
