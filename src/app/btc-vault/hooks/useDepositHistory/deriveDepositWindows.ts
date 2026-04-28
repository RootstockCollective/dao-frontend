import type { EpochSettledEventDto } from '@/app/api/btc-vault/v1/epoch-history/action'

import type { DepositWindowRow } from '../../services/types'

const SCALE = 10n ** 18n

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
 * Transforms an array of EpochSettledEventDto into DepositWindowRow[].
 *
 * Expects input sorted **descending** by epochId (newest first).
 * Output maintains the same descending order.
 *
 * For each epoch:
 * - `startDate` is the previous epoch's `closedAt` (null for the oldest epoch)
 * - `endDate` is this epoch's `closedAt`
 * - `apy` is read from the DTO (server-computed decimal) and rescaled to a percentage
 */
export function buildDepositWindowRows(dtos: EpochSettledEventDto[]): DepositWindowRow[] {
  return dtos.map((dto, i) => {
    const assets = BigInt(dto.assets)
    const supply = BigInt(dto.supply)
    const closedAt = Number(dto.closedAt)
    const pricePerShare = derivePricePerShare(assets, supply)

    const hasPrevious = i + 1 < dtos.length
    const previousDto = hasPrevious ? dtos[i + 1] : null
    const apy = dto.apy === null ? null : dto.apy * 100

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
