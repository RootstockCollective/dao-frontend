import { Address } from 'viem'

export type BucketItem = {
  amount: string
  fiatAmount: string
  formattedAmount: string
}

export type Bucket = {
  RIF: BucketItem
  USDRIF: BucketItem
  RBTC: BucketItem
}

export interface TreasuryAsset {
  title: string
  bucket: BucketItem | undefined
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
