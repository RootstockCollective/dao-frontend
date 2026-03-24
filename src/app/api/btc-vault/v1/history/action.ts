import { mapActionToDisplayStatus } from './mapActionToDisplayStatus'
import { fetchBtcVaultHistoryFromBlockscout, getFromBlockscoutSource } from './sources/blockscout'
import {
  enrichHistoryWithRequestStatus,
  getFromTheGraphSource,
  queryBtcVaultHistoryCountFromSubgraph,
} from './sources/get-from-the-graph-source'
import type { BtcVaultHistoryDataSourceName, BtcVaultHistorySource } from './sources/types'
import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus, BtcVaultHistoryQueryParams } from './types'

export type {
  BtcVaultHistoryDisplayStatus,
  BtcVaultHistoryItem,
  BtcVaultHistoryItemWithStatus,
  BtcVaultHistoryQueryParams,
  BtcVaultHistoryDisplayStatus as BtcVaultHistoryStatusKey,
} from './types'

export type { BtcVaultHistoryDataSourceName }

export interface BtcVaultHistoryFetchError {
  source: BtcVaultHistoryDataSourceName
  message: string
}

export interface BtcVaultHistoryPageResult {
  items: BtcVaultHistoryItem[]
  total: number
  source: BtcVaultHistoryDataSourceName | null
  errors: BtcVaultHistoryFetchError[]
}

/** Result after fetch + source-scoped enrichment (unified pipeline). */
export interface BtcVaultHistoryPageEnrichedResult {
  data: BtcVaultHistoryItemWithStatus[]
  total: number
  source: BtcVaultHistoryDataSourceName | null
  errors: BtcVaultHistoryFetchError[]
}

function enrichHistoryDisplayStatusFromActionOnly(item: BtcVaultHistoryItem): BtcVaultHistoryItemWithStatus {
  return { ...item, displayStatus: mapActionToDisplayStatus(item.action) }
}

const theGraphHistorySource: BtcVaultHistorySource = getFromTheGraphSource({
  mapActionOnly: enrichHistoryDisplayStatusFromActionOnly,
})

const blockscoutHistorySource: BtcVaultHistorySource = getFromBlockscoutSource({
  mapActionOnly: enrichHistoryDisplayStatusFromActionOnly,
})

const historySourcesOrdered: BtcVaultHistorySource[] = [theGraphHistorySource, blockscoutHistorySource]

/**
 * Fetches a page of BTC vault history with **source-scoped** enrichment: tries **The Graph** first, then **Blockscout** (DAO-2106).
 * Each source runs `fetchPageAndTotal` then `enrichWithStatus` on that source only (no Apollo enrichment when Blockscout served the list).
 */
export async function fetchBtcVaultHistoryPageAndEnrich(
  params: BtcVaultHistoryQueryParams,
): Promise<BtcVaultHistoryPageEnrichedResult> {
  const errors: BtcVaultHistoryFetchError[] = []

  for (const source of historySourcesOrdered) {
    try {
      const { items, total } = await source.fetchPageAndTotal(params)
      const data = await source.enrichWithStatus(items)
      return { data, total, source: source.name, errors }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[btc-vault][DAO-2106] History source "${source.name}" failed`, error)
      errors.push({ source: source.name, message })
    }
  }

  return { data: [], total: 0, source: null, errors }
}

function historyItemFromEnriched(row: BtcVaultHistoryItemWithStatus): BtcVaultHistoryItem {
  const { displayStatus: _displayStatus, ...item } = row
  return item
}

/**
 * Fetches raw items + total (no cross-source enrichment). Prefer {@link fetchBtcVaultHistoryPageAndEnrich} for the API route.
 */
export async function fetchBtcVaultHistoryPageAndTotal(
  params: BtcVaultHistoryQueryParams,
): Promise<BtcVaultHistoryPageResult> {
  const enriched = await fetchBtcVaultHistoryPageAndEnrich(params)
  return {
    items: enriched.data.map(historyItemFromEnriched),
    total: enriched.total,
    source: enriched.source,
    errors: enriched.errors,
  }
}

/**
 * @deprecated Prefer `fetchBtcVaultHistoryPageAndTotal` from the route to avoid duplicate subgraph/Blockscout work.
 */
export async function getGlobalBtcVaultHistory(
  params: BtcVaultHistoryQueryParams,
): Promise<BtcVaultHistoryItem[]> {
  const { data } = await fetchBtcVaultHistoryPageAndEnrich(params)
  return data.map(historyItemFromEnriched)
}

/**
 * @deprecated Prefer `fetchBtcVaultHistoryPageAndTotal` from the route to avoid duplicate subgraph/Blockscout work.
 */
export async function getBtcVaultHistoryCount(address: string, type?: string[]): Promise<number> {
  try {
    return await queryBtcVaultHistoryCountFromSubgraph(address, type)
  } catch (error) {
    console.warn('[btc-vault][DAO-2106] Subgraph count failed; falling back to Blockscout total', error)
    const { total } = await fetchBtcVaultHistoryFromBlockscout({
      limit: 1,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      type,
      address: address === 'global' ? undefined : address,
    })
    return total
  }
}

/**
 * Like {@link enrichHistoryWithRequestStatus} but falls back to action-only `displayStatus` when subgraph enrichment fails.
 */
export async function enrichHistoryWithRequestStatusSafe(
  history: BtcVaultHistoryItem[],
): Promise<BtcVaultHistoryItemWithStatus[]> {
  try {
    return await enrichHistoryWithRequestStatus(history)
  } catch (error) {
    console.warn('[btc-vault][DAO-2106] Subgraph enrichment failed; using action-only displayStatus', error)
    return history.map(enrichHistoryDisplayStatusFromActionOnly)
  }
}

export { enrichHistoryWithRequestStatus }
