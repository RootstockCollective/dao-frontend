/* eslint-disable quotes */
import { nftContracts } from '@/lib/contracts'
import { FC, ReactNode } from 'react'
import { Header, Paragraph } from '@/components/Typography'
import { ipfsGatewayUrl } from '@/lib/ipfs'

export interface CommunityItem {
  leftImageSrc: string
  title: string
  subtitle: string
  description: string
  nftAddress: string
  numberOfMembers: number
  /** Default NFT image for the community */
  cover: string
  detailedDescription: ReactNode
  specialPower: string
  activation: string
  requirement: string
  isMintable?: boolean
  additionalChecks?: { name: string; check: (data: any) => boolean; alertMessage: string }[]
  readMoreLink?: string
  discussionLink?: string
  campaignDetails?: FC<{ activation?: ReactNode }>
  isExternal?: boolean
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

// For details on how to add IPFS images, see `src/lib/README-IPFS.md`
export const earlyAdoptersCommunity: CommunityItem = {
  leftImageSrc: ipfsGatewayUrl('QmfDwhwpU21G9x2kzbhw1LjQGDUFLucAjcJsn8ivqTgXrm/1.png'),
  title: 'Early Adopters',
  subtitle: 'DeFi',
  description:
    'The Early Adopters badge symbolizes foresight and commitment, awarded to those who staked their claim early.',
  nftAddress: nftContracts.EA,
  numberOfMembers: 0,
  cover: ipfsGatewayUrl('QmUSCZPeHVUtdScnnBfFbxUA5ndC3xw3oNBZ83BnfEKMyK/101.png'),
  isMintable: true,
  detailedDescription: (
    <>
      The Early Adopters badge symbolizes foresight and commitment, awarded to the first pioneers who saw the
      potential of RootstockCollective and staked their claim early. These digital trailblazers embody the
      spirit of innovation and are the foundation of the community.
    </>
  ),
  specialPower: 'Voting Booster',
  activation: 'July 2025',
  requirement: 'First 101 stakers with 1 stRIF, Self-Claim',
}

export const ogFounders: CommunityItem = {
  leftImageSrc: ipfsGatewayUrl('QmVL654arKhZu2BiUMnAcqHahg9iwwxdrdaDF8BaDQZYqx'),
  title: 'OG Founders',
  subtitle: 'DeFi',
  description:
    "The OG Founders badge celebrates the visionaries who laid the groundwork for RootstockCollective's success.",
  nftAddress: nftContracts.OG_FOUNDERS,
  numberOfMembers: 0,
  cover: ipfsGatewayUrl('QmQ5roZkJfCYe7MwajxjVcLE958A6dY7FMSNTZzXChma7p'),
  isMintable: false,
  detailedDescription: (
    <>
      The OG Founders badge celebrates the visionaries who laid the groundwork for RootstockCollective&apos;s
      success. These early supporters are recognized as the architects of the DAO&apos;s future.
    </>
  ),
  specialPower: 'Voting Booster',
  activation: 'H2 2025',
  requirement: '1 stRIF on 23rd Sept 2024, Self-Claim',
}

export const ogFoundersEcosystemPartners: CommunityItem = {
  leftImageSrc: ipfsGatewayUrl('QmZdtTofnqG2HC8XB7Dab7xnWxYGmn9kUWqP1gBxpSipvW'),
  title: 'OG Partners',
  subtitle: 'DeFi',
  description:
    'The OG Partners badge honors external collaborators who joined RootstockCollective in its early days.',
  nftAddress: nftContracts.OG_PARTNERS,
  numberOfMembers: 0,
  cover: ipfsGatewayUrl('QmY7WQm4uGDg7xkq1fMJuUaTHEUw3UpoEg24nhpFZG8WcT'),
  isMintable: false,
  detailedDescription: (
    <>
      The OG Partners badge honors external collaborators who joined RootstockCollective in its early days.
      This badge represents their invaluable contributions to the ecosystem&apos;s growth and their role in
      shaping its trajectory.
    </>
  ),
  specialPower: 'Voting Booster',
  activation: 'H2 2025',
  requirement: 'Recognized Community contributions, 25k stRIF, Air-Drop',
}

export const ogFoundersExternalContributors: CommunityItem = {
  leftImageSrc: ipfsGatewayUrl('QmRJtD9EacXJ5KQRJchQPwtEjqok2fEZtAWj2696nZ7Kn1'),
  title: 'OG Contributors',
  subtitle: 'DeFi',
  description:
    "Awarded to those who demonstrated exceptional contributions during the collective's formative stages.",
  nftAddress: nftContracts.OG_CONTRIBUTORS,
  numberOfMembers: 0,
  cover: ipfsGatewayUrl('QmVqzzZ5eNR4abJydJVQp7dNcGBxWs698par1FxmyW37PH'),
  isMintable: false,
  detailedDescription: (
    <>
      Awarded to those who demonstrated exceptional contributions during the collective&apos;s formative
      stages. The OG Contributors badge recognizes the efforts of individuals who went above and beyond to
      support the DAO&apos;s vision, starting with the Shepherds.
    </>
  ),
  specialPower: 'Delegation Kickstarter OR Voting Booster',
  activation: 'March 2025',
  requirement: 'Recognized Community contributions, Air-Drop',
}

export const vanguardCommunity: CommunityItem = {
  leftImageSrc: ipfsGatewayUrl('QmZaxudWS9U6ozvbCVRHP4ksMPHDLX71yAT1mAz5xMKvzi/1.png'),
  title: 'Vanguard',
  subtitle: 'DeFi',
  description:
    'The Vanguard badge celebrates the governance pioneers who actively participate in shaping the DAO.',
  nftAddress: nftContracts.VANGUARD,
  numberOfMembers: 0,
  cover: ipfsGatewayUrl('QmZaxudWS9U6ozvbCVRHP4ksMPHDLX71yAT1mAz5xMKvzi/2.png'),
  isMintable: true,
  detailedDescription: (
    <>
      The Vanguard badge celebrates the governance pioneers who actively participate in shaping the DAO. These
      members are the guiding stars, lighting the path toward shared prosperity.
    </>
  ),
  specialPower: 'Voting Booster',
  activation: 'April 2025',
  requirement: 'Voted on 1 of the last 3 proposals, Self-Claim',
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
  leftImageSrc: ipfsGatewayUrl('bafybeibkzvkxkticjh26dngcym35mlzf6mwb3d24z3fgi5ty3pgbojcmme/41.jpg'),
  title: 'Beta Builders',
  subtitle: 'DeFi',
  description:
    'Beta Builders are the innovation heroes, creating the dApps and protocols that define our ecosystem.',
  nftAddress: nftContracts.BB,
  numberOfMembers: 0,
  cover: ipfsGatewayUrl('bafybeibkzvkxkticjh26dngcym35mlzf6mwb3d24z3fgi5ty3pgbojcmme/41.jpg'),
  isMintable: false,
  campaignDetails: ({ activation = 'MAY 2025' }) => (
    <>
      <div className={DEFAULT_CLASS_FOR_ROW_CONTAINER}>
        <Row leftText="SPECIAL POWER" rightText="Voting Booster" />
        <Row leftText="REQUIREMENT" rightText="First 50 CollectiveRewards Builders, Air-Drop" />
        <Row leftText="ACTIVATION" rightText={activation} />
      </div>
    </>
  ),
  detailedDescription: (
    <>
      Beta Builders are the innovation heroes, creating the dApps and protocols that define our ecosystem.
      This badge is a testament to their contributions to advancing Bitcoin&apos;s utility through
      cutting-edge development.
    </>
  ),
  specialPower: 'Voting Booster',
  activation: 'H2 2025',
  requirement: 'First 50 CollectiveRewards Builders, Air-Drop',
  discussionLink: 'https://discord.com/channels/842021106956238848/1284160805671272458',
}

export const rootstockHacktivator: CommunityItem = {
  leftImageSrc: '/images/nfts/rsk-hacktivator-thumb.png',
  title: 'HACKTIVATOR',
  subtitle: '', // Not necessary
  description: 'Developers evolve Rootstock by contributing code or educational content - for rewards.',
  nftAddress: '', // It's just a LINK - not an actual NFT
  numberOfMembers: 0,
  isMintable: false,
  readMoreLink: 'https://dev.rootstock.io/resources/contribute/hacktivator/',
  cover: '',
  detailedDescription: <></>,
  specialPower: '',
  activation: '',
  requirement: '',
  isExternal: true,
}

export const communitiesToRender = [
  earlyAdoptersCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
  vanguardCommunity,
  betaBuilders,
]

export const communitiesMapByContract = Object.fromEntries(
  communitiesToRender.map(community => [community.nftAddress, community]),
)
