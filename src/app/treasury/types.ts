import { Address } from 'viem'
import { RIF, USDRIF, RBTC } from '@/lib/constants'

type BucketItem = {
  amount: string
  fiatAmount: string
  formattedAmount: string
}

export type Bucket = {
  [RIF]: BucketItem
  [USDRIF]: BucketItem
  [RBTC]: BucketItem
}

interface TreasuryAsset {
  title: string
  bucket: BucketItem | undefined
}

interface TreasurySectionData {
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
