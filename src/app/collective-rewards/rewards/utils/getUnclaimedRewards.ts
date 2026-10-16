import type Big from 'big.js'
import type { Address } from 'viem'

import type { TokenBackerRewards } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { getFiatAmount } from '@/app/shared/formatter'
import type { GetPricesResult } from '@/app/user/types'
import BigNumber from '@/lib/big'
import { REWARD_TOKEN_KEYS, type RewardToken, TOKENS } from '@/lib/tokens'

export interface UnclaimedRewardsByToken {
  symbol: RewardToken['symbol']
  /** Earned across every gauge, in wei. */
  value: bigint
  price: number
  fiat: Big
}

export interface UnclaimedRewards {
  byToken: UnclaimedRewardsByToken[]
  /** Fiat value of every reward token added together. */
  total: Big
}

type RewardsPerToken = Record<string, Pick<TokenBackerRewards, 'earned'>> | undefined

const sumEarned = (earned: Record<Address, bigint> | undefined) =>
  Object.values(earned ?? {}).reduce((acc, value) => acc + value, 0n)

/**
 * What a backer can still claim, per reward token and in total, valued at the current prices.
 * Shared by every place that shows the backer's unclaimed rewards so they always agree.
 */
export const getUnclaimedRewards = (
  rewardsPerToken: RewardsPerToken,
  prices: GetPricesResult,
): UnclaimedRewards => {
  const byToken = REWARD_TOKEN_KEYS.map(tokenKey => {
    const { symbol, address } = TOKENS[tokenKey]
    const price = prices[symbol]?.price ?? 0
    const value = sumEarned(rewardsPerToken?.[address]?.earned)

    return { symbol, value, price, fiat: getFiatAmount(value, price) }
  })

  const total = byToken.reduce((acc, { fiat }) => acc.add(fiat), BigNumber(0))

  return { byToken, total }
}
