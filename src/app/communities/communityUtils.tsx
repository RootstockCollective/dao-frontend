/* eslint-disable quotes */
import { nftContracts } from '@/lib/contracts'
import { FC, ReactNode } from 'react'

interface CommunityItem {
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
}

export const earlyAdoptersCommunity = {
  leftImageSrc: '/images/ea-nft-dog.png',
  title: 'Early Adopters',
  subtitle: 'DeFi',
  description:
    'The Early Adopters badge symbolizes foresight and commitment, awarded to the first pioneers who saw the potential of RootstockCollective and staked their claim early. These digital trailblazers embody the spirit of innovation and are the foundation of the community.',
  nftAddress: nftContracts.EA,
  numberOfMembers: 0,
  cover: '/images/nfts/ea-nft-cover.png',
  isMintable: true,
  longDescription: (
    { activation = 'JUL 2025' }: { activation?: ReactNode }, // DAO TODO: the whole object should be properly typed
  ) => (
    <>
      <p className="mt-4">
        The Early Adopters collection features a vibrant array of digital pioneers, each uniquely crafted to
        embody the spirit of innovation and community in the blockchain world. From governance and protocol
        architects to visionary explorers and collaborative creators, these NFTs represent the diverse talents
        and passions driving the decentralized revolution.
      </p>
      <p className="mt-4">
        Whether blazing new trails as blockchain pioneers, nurturing the ecosystem as open-source champions,
        or guiding the community as decentralized thinkers, each character in this collection is a testament
        to the boundless creativity and dedication of those building the future of Bitcoin and beyond.
      </p>
      <p className="mt-4">
        Join the journey with these extraordinary individuals as they carve out a new digital frontier, one
        block at a time.
      </p>
      <p className="mt-4">
        <b>SPECIAL POWER:</b> Voting Booster
        <br />
        <b>REQUIREMENT:</b> First 150 stakers with 1 stRIF, Self-Claim
        <br />
        <b>ACTIVATION:</b> {activation}
      </p>
    </>
  ),
}

export const ogFounders: CommunityItem = {
  leftImageSrc: '/images/nfts/og-founders-thumb.png',
  title: 'OG Founders',
  subtitle: 'DeFi',
  description:
    "The OG Founders badge celebrates the visionaries who laid the groundwork for RootstockCollective's success. These early supporters are recognized as the architects of the DAO's future.",
  nftAddress: nftContracts.OG_FOUNDERS,
  numberOfMembers: 0,
  cover: '/images/nfts/founders-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'MAY 2025' }) => (
    <>
      <p className="mt-4">
        In the magical realm of Rootstock, a select group of visionary elves, known as the Founders, received
        the prestigious OG Badge. This badge was a testament to their foresight and pioneering spirit, marking
        them as the true architects of their era.
      </p>
      <p className="mt-4">
        <b>SPECIAL POWER:</b> Voting Booster
        <br />
        <b>REQUIREMENT:</b> 1 stRIF on 23rd Sept 2024, Self-Claim
        <br />
        <b>ACTIVATION:</b> {activation}
      </p>
    </>
  ),
}

export const ogFoundersEcosystemPartners: CommunityItem = {
  leftImageSrc: '/images/nfts/og-partners-thumb.jpg',
  title: 'OG Partners',
  subtitle: 'DeFi',
  description:
    "The OG Partners badge honours external collaborators who joined RootstockCollective in its early days. This badge represents their invaluable contributions to the ecosystem's growth and their role in shaping its trajectory.",
  nftAddress: nftContracts.OG_PARTNERS,
  numberOfMembers: 0,
  cover: '/images/nfts/partners-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'JUN 2025' }) => (
    <>
      <p className="mt-4">
        In the magical realm of Rootstock, a new chapter unfolds as the elves of the RootstockCollective
        embark on an extraordinary journey. Equipped with the OG Badge, these visionary elves invite their
        esteemed external partners to join them in exploring and innovating within the Rootstock ecosystem.
      </p>
      <p className="mt-4">
        <b>SPECIAL POWER:</b> Voting Booster
        <br />
        <b>REQUIREMENT:</b> Recognised Community contributions, 25k stRIF, Air-Drop
        <br />
        <b>ACTIVATION:</b> {activation}
      </p>
    </>
  ),
}

export const ogFoundersExternalContributors: CommunityItem = {
  leftImageSrc: '/images/nfts/og-contributors-thumb.jpg',
  title: 'OG Contributors',
  subtitle: 'DeFi',
  description:
    "Awarded to those who demonstrated exceptional contributions during the collective's formative stages, the OG Contributors badge recognizes the efforts of individuals who went above and beyond to support the DAO's vision, starting with the Shepherds.",
  nftAddress: nftContracts.OG_CONTRIBUTORS,
  numberOfMembers: 0,
  cover: '/images/nfts/contributors-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'MAR 2025' }) => (
    <>
      <p className="mt-4">
        In the enchanting realm of Rootstock, a thrilling new chapter unfolds as this dedicated and
        specialised club in the community embark on an extraordinary journey making outstanding contributions
        to the Collective starting with the Shepherds. These visionaries, recognized for their remarkable
        contributions, are bestowed with the prestigious OG Contributors Badge - a symbol of honor that
        highlights their passion and engagement with Governance process and community needs.
      </p>
      <p className="mt-4">
        <b>SPECIAL POWER:</b> Delegation Kickstarter OR Voting Booster
        <br />
        <b>REQUIREMENT:</b> Recognised Community contributions, Air-Drop
        <br />
        <b>ACTIVATION:</b> {activation}
      </p>
    </>
  ),
}

export const vanguardCommunity = {
  leftImageSrc: '/images/nfts/vanguard-thumb.jpg',
  title: 'Vanguard',
  subtitle: 'DeFi',
  description:
    'The Voting Vanguard badge celebrates the governance pioneers who actively participate in shaping the DAO. These members are the guiding stars, lighting the path toward shared prosperity.',
  nftAddress: nftContracts.VANGUARD,
  numberOfMembers: 0,
  cover: '/images/nfts/vanguard-cover.jpg',
  isMintable: true,
  longDescription: (
    { activation = 'APR 2025' }: { activation?: ReactNode }, // DAO TODO: the whole object should be properly typed
  ) => (
    <>
      <p className="mt-4">
        The Voting Vanguards are the daring cosmonauts of RootstockCollective, charting new frontiers in
        decentralized governance. To join their ranks, you must engage in DAO voting and help guide the
        ecosystem toward shared prosperity. Adorned with glowing Bitcoin energy, these spacefaring pioneers
        symbolize innovation and unity. They embody the courage to explore uncharted territories, lighting the
        way for a decentralized future and proving that collective action can transform the Bitcoin universe.
      </p>
      <p className="mt-4">
        <b>SPECIAL POWER:</b> Voting Booster
        <br />
        <b>REQUIREMENT:</b> Voted on 1 of the last 3 proposals, Self-Claim
        <br />
        <b>ACTIVATION:</b> {activation}
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
  leftImageSrc: '/images/nfts/bb-thumb.png',
  title: 'Beta Builders',
  subtitle: 'DeFi',
  description:
    "Beta Builders are the innovation heroes, creating the dApps and protocols that define our ecosystem. This badge is a testament to their contributions to advancing Bitcoin's utility through cutting-edge development.",
  nftAddress: nftContracts.BB,
  numberOfMembers: 0,
  cover: '/images/nfts/bb-cover.png',
  isMintable: false,
  longDescription: ({ activation = 'MAY 2025' }) => (
    <>
      <p className="mt-4">
        The Beta Builders collection is a badge of honor for the visionaries shaping the future of Bitcoin
        through RootstockCollective. It celebrates the pioneering Builders, Developers, Protocols, and dApps
        whose innovations are driving Rootstock in becoming the leading Bitcoin Layer 2.
      </p>
      <p className="mt-4">
        <b>SPECIAL POWER:</b> Voting Booster
        <br />
        <b>REQUIREMENT:</b> First 50 CollectiveRewards Builders, Air-Drop
        <br />
        <b>ACTIVATION:</b> {activation}
      </p>
    </>
  ),
}

export const communitiesToRender = [
  earlyAdoptersCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
  vanguardCommunity,
  betaBuilders,
]

export const communitiesMapByContract = communitiesToRender.reduce<Record<string, CommunityItem>>(
  (prev, currentValue) => {
    prev[currentValue.nftAddress] = currentValue
    return prev
  },
  {},
)
