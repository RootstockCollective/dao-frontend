export interface CommunityCardProps {
  title: string
  description: string
  members: string
  link: string
  img?: string
  alt?: string
  isBoosted?: boolean
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
  formattedBalance: string
}

export type TokenBalanceRecord = Record<string, TokenBalance>

