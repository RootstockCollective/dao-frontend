import { JSX } from 'react'
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

interface Reward {
  amount: RewardAmount
  logo?: JSX.Element
}
export type TokenRewards = Record<Token['symbol'], Reward>
