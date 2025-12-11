export interface AddressToken {
  name: string
  symbol: string
  contractAddress: string
  decimals: number
  balance: string
}

export type GetAddressTokenResult = AddressToken[]

export interface TokenBalance {
  balance: string
  symbol: string
  formattedBalance: string
}

export type TokenBalanceRecord = Record<string, TokenBalance>

interface Price {
  price: number
  lastUpdated: string
}

export type GetPricesResult = Record<string, Price | null>
