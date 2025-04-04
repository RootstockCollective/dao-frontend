import { Address } from 'viem'

export type Token = {
  symbol: string
  address: Address
}

export interface RewardAmount {
  value: bigint
  price: number
  symbol: string
  currency: string
}

export interface Reward {
  amount: RewardAmount
  logo?: JSX.Element
}
export type TokenRewards = Record<string, Reward>
export interface RewardDetails {
  builder: Address
  gauges: Address[]
  currency?: string
  tokens: Record<string, Token>
}

export interface BuilderRewardDetails extends RewardDetails {
  gauge: Address
}

export interface BackerRewardPercentage {
  current: bigint
  next: bigint
  cooldownEndTime: bigint
}
