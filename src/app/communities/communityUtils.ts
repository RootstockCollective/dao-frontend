import { nftContracts } from '@/lib/contracts'

export const firstCommunity = {
  leftImageSrc: '/images/ea-nft-dog.png',
  title: 'Early Adopters',
  subtitle: 'DeFi',
  description:
    'The Early Adopters collection features a vibrant array of digital pioneers, each uniquely crafted to embody the spirit of innovation and community in the blockchain world.',
  nftAddress: nftContracts.EA,
  numberOfMembers: 0,
}

export const ogFounders = {
  leftImageSrc: '/images/nfts/og-founders-thumb.png',
  title: 'OG Founders',
  subtitle: 'DeFi',
  description:
    'In the magical realm of Rootstock, a select group of visionary elves, known as the Founders, received the prestigious OG Badge. This badge was a testament to their foresight and pioneering spirit, marking them as the true architects of their era.',
  nftAddress: nftContracts.OG_FOUNDERS,
  numberOfMembers: 0,
}

export const ogFoundersEcosystemPartners = {
  leftImageSrc: '/images/nfts/og-partners-thumb.jpg',
  title: 'OG Founders - Ecosystem Partners',
  subtitle: 'DeFi',
  description:
    'In the magical realm of Rootstock, a new chapter unfolds as the elves of the RootstockCollective embark on an extraordinary journey. Equipped with the OG Badge, these visionary elves invite their esteemed external partners to join them in exploring and innovating within the Rootstock ecosystem.',
  nftAddress: nftContracts.OG_PARTNERS,
  numberOfMembers: 0,
}

export const ogFoundersExternalContributors = {
  leftImageSrc: '/images/nfts/og-contributors-thumb.jpg',
  title: 'OG Founders - External Contributors',
  subtitle: 'DeFi',
  description:
    'In the enchanting realm of Rootstock, a thrilling new chapter unfolds as the elves of the RootstockCollective embark on an extraordinary journey. These visionary elves, recognized for their remarkable contributions, are bestowed with the prestigious OG Badge—a symbol of honor that grants them special powers.',
  nftAddress: nftContracts.OG_CONTRIBUTORS,
  numberOfMembers: 0,
}

export const communitiesToRender = [
  firstCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
]

type CommunityType = typeof firstCommunity

export const communitiesMapByContract = communitiesToRender.reduce<Record<string, CommunityType>>(
  (prev, currentValue) => {
    prev[currentValue.nftAddress] = currentValue
    return prev
  },
  {},
)
