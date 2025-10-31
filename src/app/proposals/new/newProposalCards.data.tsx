import { type StaticImageData } from 'next/image'
import grantImage from './images/grant.png'
import rewardsImage from './images/rewards.png'
import grantBigImage from './images/grant-big.png'
import grantSmallImage from './images/grant-small.png'
import rewardsBigImage from './images/rewards-big.png'
import rewardsSmallImage from './images/rewards-small.png'
import { ProposalCategory } from '@/shared/types'
import { Paragraph } from '@/components/Typography'

interface NewProposalCardCoreProps {
  type: ProposalCategory
  cardTitle: string
  textBlock: React.ReactNode
}

export interface NewProposalCardBaseData extends NewProposalCardCoreProps {
  image: StaticImageData
  smallImage: StaticImageData
  buttonText: string
  buttonDataTestId: string
}
export interface NewProposalCardExtendedData extends NewProposalCardCoreProps {
  bigImage: StaticImageData
  detailsUrl: string
  bottomTitle: string
  bottomTextBlock: {
    header: string
    text: React.ReactNode
    url: string
    dataTestId: string
  }[]
}

export type NewProposalCardData = NewProposalCardBaseData & NewProposalCardExtendedData

export const newProposalCards: NewProposalCardData[] = [
  {
    type: ProposalCategory.Grants,
    image: grantImage,
    bigImage: grantBigImage,
    smallImage: grantSmallImage,
    cardTitle: 'Grant',
    textBlock: (
      <>
        <Paragraph>
          Community backed - your proposal is voted on inside the DAO, aligning funding with ecosystem
          priorities.
        </Paragraph>
        <Paragraph>
          When you pass through community voting your funding is unlocked as you achieve your milestones!
          Receive funding as you deliver on clear, measurable goals - all with full transparency and community
          oversight at every stage.
        </Paragraph>
      </>
    ),
    buttonText: 'Apply for a Grant',
    buttonDataTestId: 'ApplyForGrantButton',
    bottomTitle: 'Before you apply for a Grant',
    bottomTextBlock: [
      {
        header: 'Align with ecosystem goals',
        text: (
          <Paragraph>Make sure that your project supports the goals of the Rootstock Ecosystem</Paragraph>
        ),
        url: 'https://rootstockcollective.xyz/submitting-a-grant-proposal/',
        dataTestId: 'GrantProposalLink',
      },
      {
        header: 'Complete KYC',
        text: <Paragraph>Start your KYC early to avoid delays if your proposal passes the vote</Paragraph>,
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
        dataTestId: 'KYCProposalLink',
      },
      {
        header: 'Post on Discourse',
        text: <Paragraph>Share your proposal idea with the community for feedback</Paragraph>,
        url: 'https://gov.rootstockcollective.xyz/c/grants/5',
        dataTestId: 'DiscourseProposalLink',
      },
    ],
    detailsUrl: '/proposals/new/details/grants',
  },
  {
    type: ProposalCategory.Activation,
    image: rewardsImage,
    bigImage: rewardsBigImage,
    smallImage: rewardsSmallImage,
    cardTitle: 'Builders Rewards',
    textBlock: (
      <>
        <Paragraph>
          This program aims to create a decentralized and community-driven mechanism to reward builders.
        </Paragraph>
        <Paragraph>
          Builders in this context are developers or projects who are members of the RootstockCollective and
          constant contributors to the Rootstock ecosystem who have been approved by the community to receive
          Collective Rewards on a regular basis.
        </Paragraph>
      </>
    ),
    buttonText: 'Join Builders Rewards',
    buttonDataTestId: 'JoinBuilderRewardsButton',
    bottomTitle: 'Before you create a proposal',
    bottomTextBlock: [
      {
        header: 'Post on Discourse',
        text: <Paragraph>Create a Join Builders Rewards post off-chain</Paragraph>,
        url: 'https://gov.rootstockcollective.xyz/c/collective-rewards/7',
        dataTestId: 'DiscourseProposalLink',
      },
      {
        header: 'Complete KYC',
        text: <Paragraph>Start your KYC early to avoid delays if your proposal passes the vote</Paragraph>,
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
        dataTestId: 'KYCProposalLink',
      },
    ],
    detailsUrl: '/proposals/new/details/activation',
  },
]
