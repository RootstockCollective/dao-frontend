import { Address } from 'viem'

export interface TreasuryAsset {
  title: string
  bucket: { amount: string; fiatAmount: string } | undefined
}

export interface TreasurySectionData {
  buckets: TreasuryAsset[]
  address: Address
}

export interface TreasurySection {
  description: string
  categories: { [key: string]: TreasurySectionData }
}

export type TreasuryTabKey = 'Grants' | 'Growth' | 'General'

export interface StRifHoldings {
  stRifBalance: string
  stRifUsdBalance: string
  totalFundingUsd: string
  tvlUsd: string
}
