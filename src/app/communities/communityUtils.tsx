/* eslint-disable quotes */
import { nftContracts } from '@/lib/contracts'
import { FC, ReactNode } from 'react'
import { Header, Paragraph } from '@/components/Typography'

export interface CommunityItem {
  leftImageSrc: string
  title: string
  subtitle: string
  description: string
  nftAddress: string
  numberOfMembers: number
  cover: string
  longDescription: FC<{ activation?: ReactNode }>
  isMintable?: boolean
  additionalChecks?: [{ name: string; check: (data: any) => boolean; alertMessage: string }]
  readMoreLink?: string
}

interface RowProps {
  leftText: string
  rightText?: ReactNode
}
const Row = ({ leftText, rightText }: RowProps) => (
  <>
    <Header variant="h1" className="text-[24px]">
      {leftText}
    </Header>
    <Paragraph>{rightText}</Paragraph>
  </>
)

const DEFAULT_CLASS_FOR_ROW_CONTAINER = 'mt-4 grid grid-cols-2 gap-[24px] items-center'

export const earlyAdoptersCommunity = {
  leftImageSrc: '/images/ea-nft-dog.png',
  title: 'Early Adopters',
  subtitle: 'DeFi',
  description:
    'The Early Adopters badge symbolizes foresight and commitment, awarded to those who staked their claim early.',
  nftAddress: nftContracts.EA,
  numberOfMembers: 0,
  cover: '/images/nfts/ea-nft-cover.png',
  isMintable: true,
  longDescription: (
    { activation = 'JUL 2025' }: { activation?: ReactNode }, // DAO TODO: the whole object should be properly typed
  ) => (
    <>
      <p className="mt-4">
        The Early Adopters badge symbolizes foresight and commitment, awarded to the first pioneers who saw
        the potential of RootstockCollective and staked their claim early. These digital trailblazers embody
        the spirit of innovation and are the foundation of the community.
      </p>
      <p className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="First 150 stakers with 1 stRIF, Self-Claim" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </p>
    </>
  ),
}

export const ogFounders: CommunityItem = {
  leftImageSrc: '/images/nfts/og-founders-thumb.png',
  title: 'OG Founders',
  subtitle: 'DeFi',
  description:
    "The OG Founders badge celebrates the visionaries who laid the groundwork for RootstockCollective's success.",
  nftAddress: nftContracts.OG_FOUNDERS,
  numberOfMembers: 0,
  cover: '/images/nfts/founders-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'MAY 2025' }) => (
    <>
      <p className="mt-4">
        The OG Founders badge celebrates the visionaries who laid the groundwork for
        RootstockCollective&apos;s success. These early supporters are recognized as the architects of the
        DAO&apos;s future.
      </p>
      <p className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="1 stRIF on 23rd Sept 2024, Self-Claim" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </p>
    </>
  ),
}

export const ogFoundersEcosystemPartners: CommunityItem = {
  leftImageSrc: '/images/nfts/og-partners-thumb.jpg',
  title: 'OG Partners',
  subtitle: 'DeFi',
  description:
    'The OG Partners badge honors external collaborators who joined RootstockCollective in its early days.',
  nftAddress: nftContracts.OG_PARTNERS,
  numberOfMembers: 0,
  cover: '/images/nfts/partners-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'JUN 2025' }) => (
    <>
      <p className="mt-4">
        The OG Partners badge honors external collaborators who joined RootstockCollective in its early days.
        This badge represents their invaluable contributions to the ecosystem&apos;s growth and their role in
        shaping its trajectory.
      </p>
      <p className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="Recognised Community contributions, 25k stRIF, Air-Drop" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </p>
    </>
  ),
}

export const ogFoundersExternalContributors: CommunityItem = {
  leftImageSrc: '/images/nfts/og-contributors-thumb.jpg',
  title: 'OG Contributors',
  subtitle: 'DeFi',
  description:
    "Awarded to those who demonstrated exceptional contributions during the collective's formative stages.",
  nftAddress: nftContracts.OG_CONTRIBUTORS,
  numberOfMembers: 0,
  cover: '/images/nfts/contributors-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'MAR 2025' }) => (
    <>
      <p className="mt-4">
        Awarded to those who demonstrated exceptional contributions during the collective&apos;s formative
        stages. The OG Contributors badge recognizes the efforts of individuals who went above and beyond to
        support the DAO&apos;s vision, starting with the Shepherds.
      </p>
      <p className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Delegation Kickstarter OR Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="Recognised Community contributions, Air-Drop" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </p>
    </>
  ),
}

export const vanguardCommunity = {
  leftImageSrc: '/images/nfts/vanguard-thumb.jpg',
  title: 'Vanguard',
  subtitle: 'DeFi',
  description:
    'The Vanguard badge celebrates the governance pioneers who actively participate in shaping the DAO.',
  nftAddress: nftContracts.VANGUARD,
  numberOfMembers: 0,
  cover: '/images/nfts/vanguard-cover.jpg',
  isMintable: true,
  longDescription: (
    { activation = 'APR 2025' }: { activation?: ReactNode }, // DAO TODO: the whole object should be properly typed
  ) => (
    <>
      <p className="mt-4">
        The Vanguard badge celebrates the governance pioneers who actively participate in shaping the DAO.
        These members are the guiding stars, lighting the path toward shared prosperity.
      </p>
      <p className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="Voted on 1 of the last 3 proposals, Self-Claim" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </p>
    </>
  ),
  additionalChecks: [
    {
      name: 'hasVoted',
      check: (data: any) => data[0].result,
      alertMessage:
        'You are not eligible for this NFT. You must have voted on one of the last three proposals to mint.',
    },
    {
      name: 'mintLimitReached',
      check: (data: any) => {
        const mintLimit = data[0].result
        const totalSupply = data[1].result
        return mintLimit > totalSupply
      },
      alertMessage:
        'All the NFTs have been minted for this Wave. More NFTs will be unlocked soon! Check out socials to see the latest announcements.',
    },
  ],
}

export const betaBuilders: CommunityItem = {
  leftImageSrc: '/images/nfts/bb-thumb-v2.png',
  title: 'Beta Builders',
  subtitle: 'DeFi',
  description:
    'Beta Builders are the innovation heroes, creating the dApps and protocols that define our ecosystem.',
  nftAddress: nftContracts.BB,
  numberOfMembers: 0,
  cover: '/images/nfts/bb-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'MAY 2025' }) => (
    <>
      <p className="mt-4">
        Beta Builders are the innovation heroes, creating the dApps and protocols that define our ecosystem.
        This badge is a testament to their contributions to advancing Bitcoin&apos;s utility through
        cutting-edge development.
      </p>
      <p className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="First 50 CollectiveRewards Builders, Air-Drop" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </p>
    </>
  ),
}

export const rootstockHacktivator: CommunityItem = {
  leftImageSrc: '/images/nfts/rsk-hacktivator-thumb.png',
  title: 'HACKTIVATOR',
  subtitle: '', // Not necessary
  description: 'Developers evolve Rootstock by contributing code or educational content - for rewards.',
  nftAddress: '', // It's just a LINK - not an actual NFT
  numberOfMembers: 0,
  cover: '',
  isMintable: false,
  longDescription: () => '',
  readMoreLink: 'https://dev.rootstock.io/resources/contribute/hacktivator/',
}

export const communitiesToRender = [
  earlyAdoptersCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
  vanguardCommunity,
  betaBuilders,
]

export const communitiesByCategory = {
  BADGES: [
    earlyAdoptersCommunity,
    ogFounders,
    ogFoundersEcosystemPartners,
    ogFoundersExternalContributors,
    vanguardCommunity,
  ],
  CLUBS: [betaBuilders, rootstockHacktivator],
}

export const communitiesMapByContract = communitiesToRender.reduce<Record<string, CommunityItem>>(
  (prev, currentValue) => {
    prev[currentValue.nftAddress] = currentValue
    return prev
  },
  {},
)
