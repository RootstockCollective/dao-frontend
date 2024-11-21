import { Address } from 'viem'

export type Token = {
  symbol: string
  address: Address
}

export type RewardDetails = {
  builder: Address
  gauges: Address[]
  currency?: string
  tokens: {
    [token: string]: Token
  }
}

export type BuilderRewardDetails = RewardDetails & { gauge: Address }
