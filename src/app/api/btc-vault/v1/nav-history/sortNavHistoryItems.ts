import type { BtcVaultNavHistoryItem, BtcVaultNavHistorySortField } from './types'

function comparePrimary(
  a: BtcVaultNavHistoryItem,
  b: BtcVaultNavHistoryItem,
  sortField: BtcVaultNavHistorySortField,
): number {
  switch (sortField) {
    case 'processedAt':
      return a.processedAt - b.processedAt
    case 'requestsProcessedInEpoch':
      return a.requestsProcessedInEpoch - b.requestsProcessedInEpoch
    case 'reportedOffchainAssets': {
      const da = BigInt(a.reportedOffchainAssets)
      const db = BigInt(b.reportedOffchainAssets)
      if (da < db) return -1
      if (da > db) return 1
      return 0
    }
  }
}

/** Applies API sort_field / sort_direction; stable tie-break on id. */
export function sortNavHistoryItems(
  rows: readonly BtcVaultNavHistoryItem[],
  sortField: BtcVaultNavHistorySortField,
  sortDirection: 'asc' | 'desc',
): BtcVaultNavHistoryItem[] {
  const multiplier = sortDirection === 'asc' ? 1 : -1

  return [...rows].sort((a, b) => {
    const primary = comparePrimary(a, b, sortField)
    if (primary !== 0) return primary * multiplier
    return a.id.localeCompare(b.id)
  })
}
