import { nftContracts } from '@/lib/contracts'
import { ReactNode } from 'react'

interface CommunityItem {
  leftImageSrc: string
  title: string
  subtitle: string
  description: string
  nftAddress: string
  numberOfMembers: number
  cover: string
  longDescription?: ReactNode
  isMintable?: boolean
}

export const firstCommunity = {
  leftImageSrc: '/images/ea-nft-dog.png',
  title: 'Early Adopters',
  subtitle: 'DeFi',
  description:
    'The Early Adopters collection features a vibrant array of digital pioneers, each uniquely crafted to embody the spirit of innovation and community in the blockchain world.',
  nftAddress: nftContracts.EA,
  numberOfMembers: 0,
  cover: '/images/nfts/ea-nft-cover.png',
  isMintable: true,
  longDescription: (
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
        <b>ACTIVATION:</b> Mar 2025
      </p>
    </>
  ),
}

export const ogFounders = {
  leftImageSrc: '/images/nfts/og-founders-thumb.png',
  title: 'OG Founders',
  subtitle: 'DeFi',
  description:
    'In the magical realm of Rootstock, a select group of visionary elves, known as the Founders, received the prestigious OG Badge. This badge was a testament to their foresight and pioneering spirit, marking them as the true architects of their era.',
  nftAddress: nftContracts.OG_FOUNDERS,
  numberOfMembers: 0,
  cover: '/images/nfts/founders-cover.png',
  isMintable: true,
  longDescription: (
    <p className="mt-4">
      <b>SPECIAL POWER:</b> Voting Booster
      <br />
      <b>REQUIREMENT:</b> 1 stRIF on 23rd Sept 2024, Self-Claim
      <br />
      <b>ACTIVATION:</b> Feb 2025
    </p>
  ),
}

export const ogFoundersEcosystemPartners = {
  leftImageSrc: '/images/nfts/og-partners-thumb.jpg',
  title: 'OG Partners',
  subtitle: 'DeFi',
  description:
    'In the magical realm of Rootstock, a new chapter unfolds as the elves of the RootstockCollective embark on an extraordinary journey. Equipped with the OG Badge, these visionary elves invite their esteemed external partners to join them in exploring and innovating within the Rootstock ecosystem.',
  nftAddress: nftContracts.OG_PARTNERS,
  numberOfMembers: 0,
  cover: '/images/nfts/partners-cover.png',
  isMintable: false,
  longDescription: (
    <p className="mt-4">
      <b>SPECIAL POWER:</b> Voting Booster
      <br />
      <b>REQUIREMENT:</b> Recognised Community contributions, 25k stRIF, Air-Drop
      <br />
      <b>ACTIVATION:</b> Apr 2025
    </p>
  ),
}

export const ogFoundersExternalContributors = {
  leftImageSrc: '/images/nfts/og-contributors-thumb.jpg',
  title: 'OG Contributors',
  subtitle: 'DeFi',
  description:
    'In the enchanting realm of Rootstock, a thrilling new chapter unfolds as the elves of the RootstockCollective embark on an extraordinary journey. These visionary elves, recognized for their remarkable contributions, are bestowed with the prestigious OG Badge—a symbol of honor that grants them special powers.',
  nftAddress: nftContracts.OG_CONTRIBUTORS,
  numberOfMembers: 0,
  cover: '/images/nfts/contributors-cover.png',
  isMintable: false,
  longDescription: (
    <p className="mt-4">
      <b>SPECIAL POWER:</b> Voting Booster
      <br />
      <b>REQUIREMENT:</b> Recognised Community contributions, 25k stRIF, Air-Drop
      <br />
      <b>ACTIVATION:</b> May 2025
    </p>
  ),
}

export const vanguardCommunity = {
  leftImageSrc: '/images/nfts/vanguard-thumb.png',
  title: 'Vanguard',
  subtitle: 'DeFi',
  description:
    'The Voting Vanguards are the daring cosmonauts of RootstockCollective, charting new frontiers in decentralized governance. To join their ranks, you must engage in DAO voting and help guide the ecosystem toward shared prosperity.',
  nftAddress: nftContracts.VANGUARD,
  numberOfMembers: 0,
  cover: '/images/nfts/vanguard-cover.png',
  isMintable: true,
  longDescription: (
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
        <b>REQUIREMENT:</b> Voted on 3 proposals, Self-Claim
        <br />
        <b>ACTIVATION:</b> Mar 2025
      </p>
    </>
  ),
}

export const communitiesToRender = [
  firstCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
]

export const communitiesMapByContract = communitiesToRender.reduce<Record<string, CommunityItem>>(
  (prev, currentValue) => {
    prev[currentValue.nftAddress] = currentValue
    return prev
  },
  {},
)
