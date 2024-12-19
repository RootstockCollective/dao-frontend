import { Address } from 'viem'

export type Token = {
  symbol: string
  address: Address
}

export type RewardAmount = {
  value: bigint
  price: number
  symbol: string
  currency: string
}

export type Reward = {
  amount: RewardAmount
  logo?: JSX.Element
}

export type TokenRewards = {
  [token: string]: Reward
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

export type BackerRewardPercentage = {
  current: bigint
  next: bigint
  cooldownEndTime: bigint
}
