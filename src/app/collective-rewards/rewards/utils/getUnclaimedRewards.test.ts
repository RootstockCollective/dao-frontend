import { parseEther } from 'viem'
import { describe, expect, it } from 'vitest'

import { TOKENS } from '@/lib/tokens'

import { getUnclaimedRewards } from './getUnclaimedRewards'

const GAUGE_A = '0x000000000000000000000000000000000000000a'
const GAUGE_B = '0x000000000000000000000000000000000000000b'

const prices = {
  [TOKENS.rif.symbol]: { price: 0.05, lastUpdated: '' },
  [TOKENS.rbtc.symbol]: { price: 100_000, lastUpdated: '' },
  [TOKENS.usdrif.symbol]: { price: 1, lastUpdated: '' },
}

describe('getUnclaimedRewards', () => {
  it('adds up every gauge per token and values the total at current prices', () => {
    const { byToken, total } = getUnclaimedRewards(
      {
        [TOKENS.rif.address]: { earned: { [GAUGE_A]: parseEther('100'), [GAUGE_B]: parseEther('100') } },
        [TOKENS.rbtc.address]: { earned: { [GAUGE_A]: parseEther('0.001') } },
        [TOKENS.usdrif.address]: { earned: { [GAUGE_B]: parseEther('5') } },
      },
      prices,
    )

    expect(byToken.map(({ symbol, value }) => [symbol, value])).toEqual([
      [TOKENS.rif.symbol, parseEther('200')],
      [TOKENS.rbtc.symbol, parseEther('0.001')],
      [TOKENS.usdrif.symbol, parseEther('5')],
    ])
    // 200 RIF × 0.05 + 0.001 rBTC × 100,000 + 5 USDRIF × 1
    expect(total.toNumber()).toBe(115)
  })

  it('reads missing rewards and missing prices as zero', () => {
    const { byToken, total } = getUnclaimedRewards(
      { [TOKENS.rif.address]: { earned: { [GAUGE_A]: parseEther('10') } } },
      {},
    )

    expect(byToken.every(({ price }) => price === 0)).toBe(true)
    expect(total.toNumber()).toBe(0)
    expect(getUnclaimedRewards(undefined, prices).total.toNumber()).toBe(0)
  })
})
