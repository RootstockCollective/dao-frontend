import { logger } from '@/lib/logger'

import { queryBtcVaultHistoryFromSubgraph } from '../history/sources/get-from-the-graph-source'
import type { BtcVaultHistoryItem } from '../history/types'

const CLAIMED_ACTION_TYPES = ['deposit_claimed', 'redeem_claimed']
const PAGE_SIZE = 1000
const MAX_PAGES = 100

/**
 * Fetches all DEPOSIT_CLAIMED and REDEEM_CLAIMED events for the given address from The Graph.
 * Pages through all results (up to 1000 per page) until no more data is returned.
 */
export async function fetchClaimedItemsFromTheGraph(address: string): Promise<BtcVaultHistoryItem[]> {
  const allItems: BtcVaultHistoryItem[] = []
  let page = 1
  let hasMore = true
  const start = Date.now()

  while (hasMore && page <= MAX_PAGES) {
    const pageStart = Date.now()
    const items = await queryBtcVaultHistoryFromSubgraph({
      limit: PAGE_SIZE,
      page,
      sort_field: 'timestamp',
      sort_direction: 'asc',
      type: CLAIMED_ACTION_TYPES,
      address: address.toLowerCase(),
    })

    logger.info(
      { page, items: items.length, elapsedMs: Date.now() - pageStart },
      'fetchClaimedItemsFromTheGraph page fetched',
    )
    allItems.push(...items)
    hasMore = items.length === PAGE_SIZE
    page++
  }

  if (page > MAX_PAGES) {
    logger.error(
      { address, totalItems: allItems.length, totalElapsedMs: Date.now() - start },
      'fetchClaimedItemsFromTheGraph hit max page cap',
    )
  } else {
    logger.info(
      { pages: page - 1, totalItems: allItems.length, totalElapsedMs: Date.now() - start },
      'fetchClaimedItemsFromTheGraph complete',
    )
  }

  return allItems
}
