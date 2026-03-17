import { describe, expect, it } from 'vitest'

import type { EpochSettledEventDto } from '@/app/api/btc-vault/v1/epoch-history/action'

import { buildDepositWindowRows, deriveApy, derivePricePerShare } from './deriveDepositWindows'

describe('derivePricePerShare', () => {
  it('computes price per share with known values', () => {
    // (1000 + 1) * 1e18 / (500 + 1) = 1001 * 1e18 / 501
    const result = derivePricePerShare(1000n, 500n)
    expect(result).toBe((1001n * 10n ** 18n) / 501n)
  })

  it('returns 1e18 when assets equals supply', () => {
    const result = derivePricePerShare(1000n, 1000n)
    // (1001 * 1e18) / 1001 = 1e18
    expect(result).toBe(10n ** 18n)
  })

  it('handles zero assets and zero supply', () => {
    // (0 + 1) * 1e18 / (0 + 1) = 1e18
    const result = derivePricePerShare(0n, 0n)
    expect(result).toBe(10n ** 18n)
  })
})

describe('deriveApy', () => {
  it('computes annualised yield for known values', () => {
    const currentNav = 1100n * 10n ** 18n
    const previousNav = 1000n * 10n ** 18n
    // 30 days apart
    const previousClosedAt = 1_000_000
    const currentClosedAt = 1_000_000 + 30 * 24 * 60 * 60

    const result = deriveApy(currentNav, previousNav, currentClosedAt, previousClosedAt)
    expect(result).not.toBeNull()
    // 10% return over 30 days annualised: (0.1 / 2592000) * 31557600 * 100 ≈ 121.7%
    expect(result).toBeCloseTo(121.74, 0)
  })

  it('returns null when previousNav is 0n', () => {
    const result = deriveApy(1000n, 0n, 2000, 1000)
    expect(result).toBeNull()
  })

  it('returns null when duration is 0', () => {
    const result = deriveApy(1100n, 1000n, 1000, 1000)
    expect(result).toBeNull()
  })
})

describe('buildDepositWindowRows', () => {
  const THREE_DTOS: EpochSettledEventDto[] = [
    {
      epochId: '3',
      reportedOffchainAssets: '500',
      assets: '3000',
      supply: '2800',
      closedAt: '1700000',
    },
    {
      epochId: '2',
      reportedOffchainAssets: '400',
      assets: '2000',
      supply: '1900',
      closedAt: '1600000',
    },
    {
      epochId: '1',
      reportedOffchainAssets: '300',
      assets: '1000',
      supply: '1000',
      closedAt: '1500000',
    },
  ]

  it('maps 3 DTOs to 3 DepositWindowRows with correct fields', () => {
    const rows = buildDepositWindowRows(THREE_DTOS)
    expect(rows).toHaveLength(3)

    // First row (epoch 3) — has startDate from epoch 2 and APY
    expect(rows[0].epochId).toBe('3')
    expect(rows[0].endDate).toBe(1700000)
    expect(rows[0].startDate).toBe(1600000)
    expect(rows[0].tvl).toBe(3000n)
    expect(rows[0].pricePerShare).toBe(derivePricePerShare(3000n, 2800n))
    expect(rows[0].apy).not.toBeNull()
    expect(rows[0].status).toBe('settled')

    // Second row (epoch 2) — has startDate from epoch 1 and APY
    expect(rows[1].epochId).toBe('2')
    expect(rows[1].endDate).toBe(1600000)
    expect(rows[1].startDate).toBe(1500000)
    expect(rows[1].apy).not.toBeNull()

    // Third row (epoch 1) — oldest, startDate=null, apy=null
    expect(rows[2].epochId).toBe('1')
    expect(rows[2].endDate).toBe(1500000)
    expect(rows[2].startDate).toBeNull()
    expect(rows[2].apy).toBeNull()
  })

  it('preserves descending order', () => {
    const rows = buildDepositWindowRows(THREE_DTOS)
    const epochIds = rows.map(r => r.epochId)
    expect(epochIds).toEqual(['3', '2', '1'])
  })

  it('handles a single DTO with startDate=null and apy=null', () => {
    const single: EpochSettledEventDto[] = [
      {
        epochId: '1',
        reportedOffchainAssets: '100',
        assets: '1000',
        supply: '1000',
        closedAt: '1500000',
      },
    ]
    const rows = buildDepositWindowRows(single)
    expect(rows).toHaveLength(1)
    expect(rows[0].startDate).toBeNull()
    expect(rows[0].apy).toBeNull()
    expect(rows[0].tvl).toBe(1000n)
    expect(rows[0].status).toBe('settled')
  })

  it('returns empty array for empty input', () => {
    const rows = buildDepositWindowRows([])
    expect(rows).toEqual([])
  })
})
