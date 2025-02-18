export interface TokenHolderAddress {
  ens_domain_name: string
  hash: string
  implementations: any[]
  is_contract: boolean
  is_verified: boolean
  metadata: null
  name: null
  private_tags: any[]
  proxy_type: null
  public_tags: any[]
  watchlist_names: any[]
}

export interface TokenHolderToken {
  address: string
  circulating_market_cap: null
  decimals: string
  exchange_rate: null
  holders: string
  icon_url: null
  name: string
  symbol: string
  total_supply: string
  type: string
  volume_24h: null
}

export interface TokenHoldersResponse {
  address: TokenHolderAddress
  token: TokenHolderToken
  token_id: null
  value: string
}

export interface NextPageParams {
  contract_address_hash?: string
  holder_count?: number
  is_name_null?: boolean
  items_count?: number
  market_cap?: string
  name?: string
  block_number?: number
  fee?: string
  hash?: string
  index?: number
  inserted_at?: string
  value?: string
}

export interface ServerResponseV2<T> {
  items: T[]
  next_page_params: NextPageParams | null
  error?: string
}

export type NftHolderItem = {
  owner: string
  id: string
  image_url: string
  metadata: Metadata
  ens_domain_name?: string
}

export type Metadata = {
  creator: string
  description: string
  external_url: string
  image: string
  name: string
}
