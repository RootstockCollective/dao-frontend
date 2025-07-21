import { Feature } from '@/config/features.conf'
import { Address } from 'viem'

export const GITHUB_ORG = 'RootstockCollective'
export const ENV = process.env.NEXT_PUBLIC_ENV as 'mainnet' | 'testnet'
export const RIF_WALLET_SERVICES_URL = process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID as string

export const RIF_ADDRESS = process.env.NEXT_PUBLIC_RIF_ADDRESS as Address
export const STRIF_ADDRESS = process.env.NEXT_PUBLIC_STRIF_ADDRESS as Address
export const USDRIF_ADDRESS = process.env.NEXT_PUBLIC_USDRIF_ADDRESS as Address
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
export const USDRIF = 'USDRIF'
export const USD_SYMBOL = '$'

export const GRANT_TOKEN_LIMITS = {
  minAmount: 0.000001,
  maxAmount: 999_999_999,
}

export const RNS_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_RNS_REGISTRY_ADDRESS as Address

export const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL
export const DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK = 30

export const GOOGLE_TAG_ID = 'GTM-PTL6VZMT'

export const MAX_NAME_LENGTH_FOR_PROPOSAL = 100
export const TALLY_DESCRIPTION_SEPARATOR = '  ' // Tally uses double spaces to separate name and description
export const WeiPerEther = 10n ** 18n
// address(uint160(uint256(keccak256("COINBASE_ADDRESS"))))
export const COINBASE_ADDRESS = '0xf7ab6cfaebbadfe8b5494022c4c6db776bd63b6b' as Address

export const REOWN_PROJECT_ID = (process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? '') as string
export const REOWN_METADATA_URL = (process.env.NEXT_PUBLIC_REOWN_METADATA_URL ?? '') as string

export const MOBILE_DESKTOP_BREAKPOINT = 768
export const MAIN_CONTAINER_ID = 'main-container'

export const FEATURE_FLAGS: Record<Feature, string> = {
  user_flags: process.env.NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS ?? '',
  v2_rewards: process.env.NEXT_PUBLIC_ENABLE_FEATURE_V2_REWARDS ?? '',
  v3_design: process.env.NEXT_PUBLIC_ENABLE_FEATURE_V3_DESIGN ?? '',
  use_the_graph: process.env.NEXT_PUBLIC_ENABLE_FEATURE_USE_THE_GRAPH ?? '',
  use_state_sync: process.env.NEXT_PUBLIC_ENABLE_FEATURE_USE_STATE_SYNC ?? '',
  debug_logs: process.env.NEXT_PUBLIC_ENABLE_FEATURE_DEBUG_LOGS ?? '',
}

export const getFeatureEnvFlags = (): Record<Feature, string> => FEATURE_FLAGS

export const MAX_PAGE_SIZE = 100
