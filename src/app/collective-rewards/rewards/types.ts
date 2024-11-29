import { Address } from 'viem'

export type Token = {
  symbol: string
  address: Address
}

export type Currency = {
  value: number
  symbol: string
}

export type Reward = {
  crypto: Currency
  fiat: Currency
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
