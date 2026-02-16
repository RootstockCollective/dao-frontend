import { JSX } from 'react'
import { Address } from 'viem'

export interface Token {
  symbol: string // FIXME: I think this often refers to key not to symbol. !! Use RewardToken type instead
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
