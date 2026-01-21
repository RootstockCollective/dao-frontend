import { Feature } from '@/config/features.conf'
import { Address } from 'viem'

export const GITHUB_ORG = 'RootstockCollective'
export const ENV = process.env.NEXT_PUBLIC_ENV as 'mainnet' | 'testnet' | 'fork'
export const RIF_WALLET_SERVICES_URL = process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID as string

// TOKENS
export const RIF_ADDRESS = process.env.NEXT_PUBLIC_RIF_ADDRESS as Address
export const STRIF_ADDRESS = process.env.NEXT_PUBLIC_STRIF_ADDRESS as Address
export const USDRIF_ADDRESS = process.env.NEXT_PUBLIC_USDRIF_ADDRESS as Address
export const USDRIF_VAULT_ADDRESS = process.env.NEXT_PUBLIC_USDRIF_VAULT_ADDRESS as Address
export const USDT0_ADDRESS = process.env.NEXT_PUBLIC_USDT0_ADDRESS as Address

// DEX Router Addresses
export const UNISWAP_UNIVERSAL_ROUTER_ADDRESS = process.env
  .NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS as Address
export const UNISWAP_QUOTER_V2_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS as Address
// Permit2 contract address
// Note: Rootstock uses a different Permit2 address than the standard CREATE2 deployment
// Rootstock Permit2: 0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5
// Standard Permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3
export const PERMIT2_ADDRESS = process.env.NEXT_PUBLIC_PERMIT2_ADDRESS as Address
export const ICECREAMSWAP_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS as Address
export const USDT0_USDRIF_POOL_ADDRESS = process.env.NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS as Address
export const GOVERNOR_ADDRESS = process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS as Address
// NFTs
export const EA_NFT_ADDRESS = process.env.NEXT_PUBLIC_EA_NFT_ADDRESS?.toLowerCase() as Address
export const OG_FOUNDERS_NFT_ADDRESS = process.env.NEXT_PUBLIC_OG_FOUNDERS?.toLowerCase() as Address
export const OG_PARTNERS_NFT_ADDRESS = process.env.NEXT_PUBLIC_OG_PARTNERS?.toLowerCase() as Address
export const OG_CONTRIBUTORS_NFT_ADDRESS = process.env.NEXT_PUBLIC_OG_CONTRIBUTORS?.toLowerCase() as Address
export const VANGUARD_NFT_ADDRESS = process.env.NEXT_PUBLIC_VANGUARD?.toLowerCase() as Address
export const BB_NFT_ADDRESS = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS?.toLowerCase() as Address
export const ROOTLINGS_S1_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_ROOTLINGS_S1_NFT_ADDRESS?.toLowerCase() as Address
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

export const AVERAGE_BLOCKTIME = 60_000
export const CACHE_REVALIDATE_SECONDS = 20

export const RIF = 'RIF'
export const USD = 'USD'
export const RBTC = ENV === 'mainnet' || ENV === 'fork' ? 'rBTC' : 'tRBTC'
// All RBTC symbol variants (mainnet and testnet) - use for symbol matching
export const RBTC_SYMBOLS = ['rbtc', 'trbtc'] as const
export const STRIF = 'stRIF'
export const USDRIF = 'USDRIF'
export const USDT0 = 'USDT0'
export const TRIF = 'tRIF'

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
export const VAULT_BASIS_POINTS = 10n ** 9n // 1e9 = 100% for vault APY calculations
export const VAULT_SHARE_MULTIPLIER = 10n ** 6n // 1e6 multiplier for vault shares (used in vault contract to prevent inflation attacks)
// address(uint160(uint256(keccak256("COINBASE_ADDRESS"))))
export const COINBASE_ADDRESS = '0xf7ab6cfaebbadfe8b5494022c4c6db776bd63b6b' as Address

export const REOWN_PROJECT_ID = (process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? '') as string
export const REOWN_METADATA_URL = (process.env.NEXT_PUBLIC_REOWN_METADATA_URL ?? '') as string

export const MOBILE_DESKTOP_BREAKPOINT = 768
export const MAIN_CONTAINER_ID = 'main-container'

const FEATURE_FLAGS: Record<Feature, string> = {
  user_flags: process.env.NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS ?? '',
  v2_rewards: process.env.NEXT_PUBLIC_ENABLE_FEATURE_V2_REWARDS ?? '',
  v3_design: process.env.NEXT_PUBLIC_ENABLE_FEATURE_V3_DESIGN ?? '',
  use_the_graph: process.env.NEXT_PUBLIC_ENABLE_FEATURE_USE_THE_GRAPH ?? '',
  use_state_sync: process.env.NEXT_PUBLIC_ENABLE_FEATURE_USE_STATE_SYNC ?? '',
  debug_logs: process.env.NEXT_PUBLIC_ENABLE_FEATURE_DEBUG_LOGS ?? '',
  vault: process.env.NEXT_PUBLIC_ENABLE_FEATURE_VAULT ?? '',
}

export const getFeatureEnvFlags = (): Record<Feature, string> => FEATURE_FLAGS

export const MAX_PAGE_SIZE = 1000

export const BLOCKSCOUT_URL = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL as string

export const VAULT_KYC_URL = process.env.NEXT_PUBLIC_VAULT_KYC_URL as string
export const VAULT_TERMS_CONDITIONS_URL = process.env.NEXT_PUBLIC_VAULT_TERMS_CONDITIONS_URL as string

// Vault slippage configuration
const DEFAULT_VAULT_SLIPPAGE_PERCENTAGE = 0.5
export const VAULT_DEFAULT_SLIPPAGE_PERCENTAGE = Number(
  process.env.NEXT_PUBLIC_VAULT_DEFAULT_SLIPPAGE_PERCENTAGE ?? DEFAULT_VAULT_SLIPPAGE_PERCENTAGE,
)

/**
 * State sync config constants
 */

const DEFAULT_STATE_SYNC_BLOCK_STALENESS_THRESHOLD = 100
export const STATE_SYNC_BLOCK_STALENESS_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_STATE_SYNC_BLOCK_STALENESS_THRESHOLD ??
    DEFAULT_STATE_SYNC_BLOCK_STALENESS_THRESHOLD,
)
