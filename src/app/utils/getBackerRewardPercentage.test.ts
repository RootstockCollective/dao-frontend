import { describe, expect, it, beforeEach } from 'vitest'
import { getBackerRewardPercentage } from './getBackerRewardPercentage'

const oneDay = 24 * 60 * 60 * 1000

describe('getBackerRewardPercentage', () => {
  let now: number
  let previousValue: bigint
  let nextValue: bigint

  beforeEach(() => {
    now = Date.now()
    previousValue = 100n
    nextValue = 20n
  })

  it('should return the previous value as the current one if the cooldown is higher than now', () => {
    const cooldownExpired = BigInt(Math.floor((now + oneDay) / 1000))

    const { current } = getBackerRewardPercentage(previousValue, nextValue, cooldownExpired)

    expect(current).toBe(previousValue)
  })

  it('should return the next value as the current one if the cooldown is lower than now', () => {
    const cooldownExpired = BigInt(Math.floor((now - oneDay) / 1000))

    const { current } = getBackerRewardPercentage(previousValue, nextValue, cooldownExpired)

    expect(current).toBe(nextValue)
  })

  it('should return the previous value as the current one if cooldown is higher than timestamp', () => {
    const cooldownExpired = BigInt(Math.floor((now + oneDay) / 1000))
    const timestampInSeconds = Math.floor(now / 1000)

    const { current } = getBackerRewardPercentage(
      previousValue,
      nextValue,
      cooldownExpired,
      timestampInSeconds,
    )

    expect(current).toBe(previousValue)
  })

  it('should return the next value as the current one if cooldown is lower than timestamp', () => {
    const cooldownExpired = BigInt(Math.floor(Date.now() / 1000))
    const timestampInSeconds = Math.floor((Date.now() + oneDay) / 1000)

    const { current } = getBackerRewardPercentage(
      previousValue,
      nextValue,
      cooldownExpired,
      timestampInSeconds,
    )

    expect(current).toBe(nextValue)
  })
})
