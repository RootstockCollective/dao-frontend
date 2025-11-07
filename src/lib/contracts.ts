import { zeroAddress } from 'viem'
import { EarlyAdoptersNFTAbi } from './abis/EarlyAdoptersNFTAbi'
import { GovernorAbi } from './abis/Governor'
import { RootlingsS1ABI } from './abis/RootlingsS1'
import { StRIFTokenAbi } from './abis/StRIFTokenAbi'
import { VotingVanguardsNftAbi } from './abis/VotingVanguardsNFTAbi'
import {
  BACKERS_MANAGER_ADDRESS,
  BB_NFT_ADDRESS,
  BUILDER_REGISTRY_ADDRESS,
  EA_NFT_ADDRESS,
  GENERAL_BUCKET_ADDRESS,
  GOVERNOR_ADDRESS,
  GRANTS_ACTIVE_BUCKET_ADDRESS,
  GRANTS_BUCKET_ADDRESS,
  GROWTH_BUCKET_ADDRESS,
  MULTICALL_ADDRESS,
  OG_CONTRIBUTORS_NFT_ADDRESS,
  OG_FOUNDERS_NFT_ADDRESS,
  OG_PARTNERS_NFT_ADDRESS,
  RBTC,
  REWARD_DISTRIBUTOR_ADDRESS,
  RIF,
  RIF_ADDRESS,
  ROOTLINGS_S1_NFT_ADDRESS,
  STRIF,
  STRIF_ADDRESS,
  USDRIF,
  USDRIF_ADDRESS,
  USDRIF_VAULT_ADDRESS,
  USDT0,
  USDT0_ADDRESS,
  VANGUARD_NFT_ADDRESS,
} from './constants'
import { VaultAbi } from '@/lib/abis/VaultAbi'

const tokenContracts = {
  [RIF]: RIF_ADDRESS,
  [STRIF]: STRIF_ADDRESS,
  [RBTC]: zeroAddress,
  [USDRIF]: USDRIF_ADDRESS,
  [USDT0]: USDT0_ADDRESS,
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
  ROOTLINGS_S1: ROOTLINGS_S1_NFT_ADDRESS,
}

export const DEFAULT_NFT_CONTRACT_ABI = EarlyAdoptersNFTAbi

const abiContractsMap = {
  [nftContracts.EA]: EarlyAdoptersNFTAbi,
  [nftContracts.OG_FOUNDERS]: EarlyAdoptersNFTAbi,
  [nftContracts.OG_CONTRIBUTORS]: EarlyAdoptersNFTAbi,
  [nftContracts.OG_PARTNERS]: EarlyAdoptersNFTAbi,
  [nftContracts.VANGUARD]: VotingVanguardsNftAbi,
  [nftContracts.BB]: EarlyAdoptersNFTAbi,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [nftContracts.ROOTLINGS_S1]: RootlingsS1ABI as any, // Type assertion to avoid TS deep instantiation error
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
  BackersManagerAddress,
  BuilderRegistryAddress,
  GovernorAddress,
  MulticallAddress,
  nftContracts,
  RewardDistributorAddress,
  tokenContracts,
  TreasuryAddress,
  treasuryContracts,
}

export const governor = {
  address: GOVERNOR_ADDRESS,
  abi: GovernorAbi,
} as const

export const stRif = {
  address: STRIF_ADDRESS,
  abi: StRIFTokenAbi,
} as const

export const vault = {
  address: USDRIF_VAULT_ADDRESS,
  abi: VaultAbi,
} as const
