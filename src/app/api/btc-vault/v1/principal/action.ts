import type { BtcVaultHistoryItem } from '../history/types'
import { fetchClaimedItemsFromBlockscout } from './fetchClaimedItemsFromBlockscout'
import { fetchClaimedItemsFromTheGraph } from './fetchClaimedItemsFromTheGraph'

export interface PrincipalEvent {
  type: 'deposit' | 'withdrawal'
  amount: string
  timestamp: number
  transactionHash: string
}

export interface UserPrincipalResult {
  principal: bigint
  events: PrincipalEvent[]
  source: string
}

/**
 * Aggregates items into net principal and maps each item to a PrincipalEvent.
 * Principal = sum(deposit_claimed assets) - sum(redeem_claimed assets), clamped to 0n.
 */
export function aggregateItems(items: BtcVaultHistoryItem[]): {
  principal: bigint
  events: PrincipalEvent[]
} {
  let principal = 0n
  const events: PrincipalEvent[] = []

  for (const item of items) {
    const assets = BigInt(item.assets)
    if (item.action === 'DEPOSIT_CLAIMED') {
      principal += assets
      events.push({
        type: 'deposit',
        amount: item.assets,
        timestamp: item.timestamp,
        transactionHash: item.transactionHash,
      })
    } else if (item.action === 'REDEEM_CLAIMED') {
      principal -= assets
      events.push({
        type: 'withdrawal',
        amount: item.assets,
        timestamp: item.timestamp,
        transactionHash: item.transactionHash,
      })
    }
  }

  return { principal: principal > 0n ? principal : 0n, events }
}

/**
 * Fetches all finalized deposit/redeem events for the given address and
 * computes net principal: sum(deposit_claimed assets) - sum(redeem_claimed assets).
 *
 * Uses The Graph (primary) with Blockscout fallback.
 * Returns 0n if no history is found or if the net is negative (guard).
 */
export async function fetchUserPrincipal(address: string): Promise<UserPrincipalResult> {
  try {
    const items = await fetchClaimedItemsFromTheGraph(address)
    return { ...aggregateItems(items), source: 'the-graph' }
  } catch (error) {
    console.warn('[btc-vault] Principal: The Graph failed, falling back to Blockscout', error)
  }

  try {
    const items = await fetchClaimedItemsFromBlockscout(address)
    return { ...aggregateItems(items), source: 'blockscout' }
  } catch (error) {
    console.warn('[btc-vault] Principal: Blockscout fallback also failed', error)
  }

  return { principal: 0n, events: [], source: 'none' }
}
