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
  leftImageSrc: '/images/nft-coming-soon.png',
  title: 'OG Founders',
  subtitle: 'N/A',
  description: 'A new community is coming, stay tuned!',
  nftAddress: '',
  numberOfMembers: 0,
}

export const ogFoundersEcosystemPartners = {
  leftImageSrc: '/images/nft-coming-soon.png',
  title: 'OG Founders - Ecosystem Partners',
  subtitle: 'N/A',
  description: 'A new community is coming, stay tuned!',
  nftAddress: '',
  numberOfMembers: 0,
}

export const ogFoundersExternalContributors = {
  leftImageSrc: '/images/nft-coming-soon.png',
  title: 'OG Founders - External Contributors',
  subtitle: 'N/A',
  description: 'A new community is coming, stay tuned!',
  nftAddress: '',
  numberOfMembers: 0,
}

export const communitiesToRender = [
  firstCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
]
