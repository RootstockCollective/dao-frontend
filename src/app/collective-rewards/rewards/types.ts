import { JSX } from 'react'

export interface RewardAmount {
  value: bigint
  price: number
  symbol: string
  currency: string
}

interface Reward {
  amount: RewardAmount
  logo?: JSX.Element
}
export type TokenRewards = Record<string, Reward>
