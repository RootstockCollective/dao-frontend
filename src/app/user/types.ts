import { TokenSymbol } from "@/lib/tokens"
import { Address } from "viem"

export type AddressToken = {
  name: string
  symbol: TokenSymbol
  contractAddress: Address
  decimals: number
  balance: string
}

export type TokenBalance = {
  balance: string
  symbol: TokenSymbol
  formattedBalance: string
}

export type TokenBalanceRecord = Partial<Record<TokenSymbol, TokenBalance>>

export type Price = {
  price: number
  lastUpdated: string
}

export type GetPricesResult = Partial<Record<TokenSymbol, Price | null>>
