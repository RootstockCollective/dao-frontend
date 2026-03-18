import type { EpochSettledEventDto } from '@/app/api/btc-vault/v1/epoch-history/action'

import type { DepositWindowRow } from '../../services/types'

const SCALE = 10n ** 18n
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60

/**
 * Derives the price-per-share (NAV per share) from total assets and total supply.
 * Uses the +1 offset to avoid division-by-zero and match the vault contract formula.
 *
 * Formula: `(assets + 1) * 1e18 / (supply + 1)`
 */
export function derivePricePerShare(assets: bigint, supply: bigint): bigint {
  return ((assets + 1n) * SCALE) / (supply + 1n)
}

/**
 * Derives annualised percentage yield from two consecutive epoch NAVs and their timestamps.
 * Returns a float percentage (e.g. 12.5 means 12.5%).
 *
 * Returns `null` when the calculation would be meaningless:
 * - previousNav is 0n (no prior reference point)
 * - duration between epochs is 0 (division by zero)
 */
export function deriveApy(
  currentNav: bigint,
  previousNav: bigint,
  currentClosedAt: number,
  previousClosedAt: number,
): number | null {
  if (previousNav === 0n) return null

  const durationSeconds = currentClosedAt - previousClosedAt
  if (durationSeconds === 0) return null

  const periodReturn = Number(currentNav - previousNav) / Number(previousNav)
  const annualised = (periodReturn / durationSeconds) * SECONDS_PER_YEAR * 100

  return annualised
}

/**
 * Transforms an array of EpochSettledEventDto into DepositWindowRow[].
 *
 * Expects input sorted **descending** by epochId (newest first).
 * Output maintains the same descending order.
 *
 * For each epoch:
 * - `startDate` is the previous epoch's `closedAt` (null for the oldest epoch)
 * - `endDate` is this epoch's `closedAt`
 * - `apy` is derived from this epoch and the previous epoch's NAV (null for the oldest)
 */
export function buildDepositWindowRows(dtos: EpochSettledEventDto[]): DepositWindowRow[] {
  return dtos.map((dto, i) => {
    const assets = BigInt(dto.assets)
    const supply = BigInt(dto.supply)
    const closedAt = Number(dto.closedAt)
    const pricePerShare = derivePricePerShare(assets, supply)

    const hasPrevious = i + 1 < dtos.length
    const previousDto = hasPrevious ? dtos[i + 1] : null

    let apy: number | null = null
    if (previousDto) {
      const previousAssets = BigInt(previousDto.assets)
      const previousSupply = BigInt(previousDto.supply)
      const previousNav = derivePricePerShare(previousAssets, previousSupply)
      apy = deriveApy(pricePerShare, previousNav, closedAt, Number(previousDto.closedAt))
    }

    return {
      epochId: dto.epochId,
      startDate: previousDto ? Number(previousDto.closedAt) : null,
      endDate: closedAt,
      tvl: assets,
      pricePerShare,
      apy,
      status: 'settled' as const,
    }
  })
}
