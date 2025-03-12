export interface CommunityCardProps {
  img: string
  title: string
  description: string
  members: string
  link: string
  isBoosted?: boolean
  alt?: string
}

export type AddressToken = {
  name: string
  symbol: string
  contractAddress: string
  decimals: number
  balance: string
}

export type GetAddressTokenResult = AddressToken[]

export type TokenBalance = {
  balance: string
  symbol: string
}

export type TokenBalanceRecord = Record<string, TokenBalance>

export type Price = {
  price: number
  lastUpdated: string
}

export type GetPricesResult = Record<string, Price | null>
