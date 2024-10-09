import { AddressToken } from '@/app/user/types'

export type TokenProjectedReward = AddressToken & {
  projectedReward: bigint
}

export const getShare = ({ balance, projectedReward }: TokenProjectedReward) => {
  const tokenBalance = BigInt(balance)
  return tokenBalance ? (projectedReward * 100n) / tokenBalance : 0n
}
