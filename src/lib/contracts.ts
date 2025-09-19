import { zeroAddress } from 'viem'
import { EarlyAdoptersNFTAbi } from './abis/EarlyAdoptersNFTAbi'
import { VotingVanguardsNftAbi } from './abis/VotingVanguardsNFTAbi'
import { StRIFTokenAbi } from './abis/StRIFTokenAbi'
import {
  EA_NFT_ADDRESS,
  GENERAL_BUCKET_ADDRESS,
  GOVERNOR_ADDRESS,
  GRANTS_ACTIVE_BUCKET_ADDRESS,
  GRANTS_BUCKET_ADDRESS,
  GROWTH_BUCKET_ADDRESS,
  MULTICALL_ADDRESS,
  RIF_ADDRESS,
  STRIF_ADDRESS,
  OG_FOUNDERS_NFT_ADDRESS,
  OG_PARTNERS_NFT_ADDRESS,
  OG_CONTRIBUTORS_NFT_ADDRESS,
  BACKERS_MANAGER_ADDRESS,
  BUILDER_REGISTRY_ADDRESS,
  REWARD_DISTRIBUTOR_ADDRESS,
  VANGUARD_NFT_ADDRESS,
  BB_NFT_ADDRESS,
  USDRIF_ADDRESS,
  RIF,
  STRIF,
  RBTC,
  USDRIF,
} from './constants'
import { GovernorAbi } from './abis/Governor'

const tokenContracts = {
  [RIF]: RIF_ADDRESS,
  [STRIF]: STRIF_ADDRESS,
  [RBTC]: zeroAddress,
  [USDRIF]: USDRIF_ADDRESS,
}
// Needed when creating proposal - uppercase [avoid case sensitive search]
export const uppercasedTokenContracts = Object.fromEntries(
  Object.entries(tokenContracts).map(([key, value]) => [key.toUpperCase(), value]),
)

export type SupportedTokens = keyof typeof tokenContracts

const nftContracts = {
  EA: EA_NFT_ADDRESS, // Early Adopters
  OG_FOUNDERS: OG_FOUNDERS_NFT_ADDRESS,
  OG_PARTNERS: OG_PARTNERS_NFT_ADDRESS,
  OG_CONTRIBUTORS: OG_CONTRIBUTORS_NFT_ADDRESS,
  VANGUARD: VANGUARD_NFT_ADDRESS,
  BB: BB_NFT_ADDRESS, // Beta Builders
}

export const DEFAULT_NFT_CONTRACT_ABI = EarlyAdoptersNFTAbi

const abiContractsMap = {
  [nftContracts.EA]: EarlyAdoptersNFTAbi,
  [nftContracts.OG_FOUNDERS]: EarlyAdoptersNFTAbi,
  [nftContracts.OG_CONTRIBUTORS]: EarlyAdoptersNFTAbi,
  [nftContracts.OG_PARTNERS]: EarlyAdoptersNFTAbi,
  [nftContracts.VANGUARD]: VotingVanguardsNftAbi,
  [nftContracts.BB]: EarlyAdoptersNFTAbi,
}

const treasuryContracts = {
  GRANTS: { name: 'Grants', address: GRANTS_BUCKET_ADDRESS },
  GRANTS_ACTIVE: { name: 'Grants - Active', address: GRANTS_ACTIVE_BUCKET_ADDRESS },
  GROWTH: { name: 'Growth', address: GROWTH_BUCKET_ADDRESS },
  GROWTH_REWARDS: { name: 'Growth - Rewards', address: REWARD_DISTRIBUTOR_ADDRESS },
  GENERAL: { name: 'General', address: GENERAL_BUCKET_ADDRESS },
}

const GovernorAddress = GOVERNOR_ADDRESS
const MulticallAddress = MULTICALL_ADDRESS
const TreasuryAddress = GRANTS_ACTIVE_BUCKET_ADDRESS

const BackersManagerAddress = BACKERS_MANAGER_ADDRESS || zeroAddress
const BuilderRegistryAddress = BUILDER_REGISTRY_ADDRESS || zeroAddress
const RewardDistributorAddress = REWARD_DISTRIBUTOR_ADDRESS || zeroAddress

export {
  abiContractsMap,
  GovernorAddress,
  MulticallAddress,
  nftContracts,
  tokenContracts,
  TreasuryAddress,
  treasuryContracts,
  BackersManagerAddress,
  BuilderRegistryAddress,
  RewardDistributorAddress,
}

export const governor = {
  address: GOVERNOR_ADDRESS,
  abi: GovernorAbi,
} as const

export const stRif = {
  address: STRIF_ADDRESS,
  abi: StRIFTokenAbi,
} as const
