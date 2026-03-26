import { queryBtcVaultHistoryFromSubgraph } from '../history/sources/get-from-the-graph-source'
import type { BtcVaultHistoryItem } from '../history/types'

const CLAIMED_ACTION_TYPES = ['deposit_claimed', 'redeem_claimed']
const PAGE_SIZE = 1000

/**
 * Fetches all DEPOSIT_CLAIMED and REDEEM_CLAIMED events for the given address from The Graph.
 * Pages through all results (up to 1000 per page) until no more data is returned.
 */
export async function fetchClaimedItemsFromTheGraph(address: string): Promise<BtcVaultHistoryItem[]> {
  const allItems: BtcVaultHistoryItem[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const items = await queryBtcVaultHistoryFromSubgraph({
      limit: PAGE_SIZE,
      page,
      sort_field: 'timestamp',
      sort_direction: 'asc',
      type: CLAIMED_ACTION_TYPES,
      address: address.toLowerCase(),
    })

    allItems.push(...items)
    hasMore = items.length === PAGE_SIZE
    page++
  }

  return allItems
}
