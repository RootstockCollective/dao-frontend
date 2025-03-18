import { Address } from 'viem'

export const GITHUB_ORG = 'RootstockCollective'
export const ENV = process.env.NEXT_PUBLIC_ENV as string
export const RIF_WALLET_SERVICES_URL = process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID as string

export const RIF_ADDRESS = process.env.NEXT_PUBLIC_RIF_ADDRESS as Address
export const STRIF_ADDRESS = process.env.NEXT_PUBLIC_STRIF_ADDRESS as Address
export const GOVERNOR_ADDRESS = process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS as Address
// NFTs
export const EA_NFT_ADDRESS = process.env.NEXT_PUBLIC_EA_NFT_ADDRESS?.toLowerCase() as Address
export const OG_FOUNDERS_NFT_ADDRESS = process.env.NEXT_PUBLIC_OG_FOUNDERS?.toLowerCase() as Address
export const OG_PARTNERS_NFT_ADDRESS = process.env.NEXT_PUBLIC_OG_PARTNERS?.toLowerCase() as Address
export const OG_CONTRIBUTORS_NFT_ADDRESS = process.env.NEXT_PUBLIC_OG_CONTRIBUTORS?.toLowerCase() as Address
export const VANGUARD_NFT_ADDRESS = process.env.NEXT_PUBLIC_VANGUARD?.toLowerCase() as Address
export const BB_NFT_ADDRESS = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS?.toLowerCase() as Address
// NFTs end
export const MULTICALL_ADDRESS = process.env.NEXT_PUBLIC_MULTICALL_ADDRESS as Address
export const GRANTS_BUCKET_ADDRESS = process.env.NEXT_PUBLIC_GRANTS_BUCKET_ADDRESS as Address
export const GRANTS_ACTIVE_BUCKET_ADDRESS = process.env.NEXT_PUBLIC_GRANTS_ACTIVE_BUCKET_ADDRESS as Address
export const GROWTH_BUCKET_ADDRESS = process.env.NEXT_PUBLIC_GROWTH_BUCKET_ADDRESS as Address
export const GENERAL_BUCKET_ADDRESS = process.env.NEXT_PUBLIC_GENERAL_BUCKET_ADDRESS as Address
export const EVENTS_FROM_BLOCK = Number(process.env.NEXT_PUBLIC_EVENTS_FROM_BLOCK ?? 0)
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as string

export const BACKERS_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BACKERS_MANAGER_ADDRESS as Address
export const BUILDER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_BUILDER_REGISTRY_ADDRESS as Address
export const REWARD_DISTRIBUTOR_ADDRESS = process.env.NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS as Address
export const NFT_BOOSTER_DATA_URL = (process.env.NEXT_PUBLIC_NFT_BOOSTER_DATA_URL as string) ?? ''

export const ADDRESS_ANIMATION_DURATION = 800
export const AVERAGE_BLOCKTIME = 60_000

export const RIF = 'RIF'
export const USD = 'USD'
export const RBTC = 'RBTC'
export const stRIF = 'stRIF'
export const USD_SYMBOL = '$'

export const RNS_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_RNS_REGISTRY_ADDRESS as Address

export const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL
export const DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK = 30

export const GOOGLE_TAG_ID = 'GTM-PTL6VZMT'

export const proposalQuickFilters = ['Grant', 'Activation', 'Wave 4', 'Wave 5', 'March-25']

export const MAX_NAME_LENGTH_FOR_PROPOSAL = 100
export const TALLY_DESCRIPTION_SEPARATOR = '  ' // Tally uses double spaces to separate name and description
export const ipfsGateway = 'https://red-legislative-meadowlark-461.mypinata.cloud/ipfs/'
