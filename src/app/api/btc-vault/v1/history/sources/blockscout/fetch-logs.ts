import { getAbiItem, type Hex, toEventSelector } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'

import {
  ACTION_TO_EVENT_NAMES,
  DERIVED_ACTION_DEPENDENCIES,
  HISTORY_EVENT_NAMES,
  MAX_BLOCKSCOUT_GETLOGS_PAGES,
  MAX_PARALLEL_BTC_VAULT_TOPIC_SCANS,
} from './constants'
import { rpcGetLogToBlockscoutLogItem } from './decode-logs'
import type { BlockscoutLogItem, BlockscoutRpcLogsResponse } from './types'

function historyTopic0sAll(): Hex[] {
  return HISTORY_EVENT_NAMES.map(name => toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name })))
}

/**
 * When `type[]` is set, only topic0s for those actions are scanned.
 * Derived actions (DEPOSIT_CLAIMABLE, etc.) also include their dependency actions'
 * topic0s so that request events are available for epoch cross-referencing.
 */
export function topic0sForActionFilter(actionFilter: Set<string> | null): Hex[] {
  if (!actionFilter || actionFilter.size === 0) {
    return historyTopic0sAll()
  }
  const expandedActions = new Set(actionFilter)
  for (const action of actionFilter) {
    const deps = DERIVED_ACTION_DEPENDENCIES[action]
    if (deps) {
      for (const dep of deps) {
        expandedActions.add(dep)
      }
    }
  }
  const topics = new Set<Hex>()
  for (const action of expandedActions) {
    const events = ACTION_TO_EVENT_NAMES[action]
    if (!events) continue
    for (const name of events) {
      topics.add(toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name })))
    }
  }
  return [...topics]
}

/**
 * Fetches logs for one `topic0` via Blockscout `getLogs`.
 */
export async function fetchVaultLogsAllPagesForTopic(
  blockscoutBaseUrl: string,
  vaultAddressLower: string,
  topic0: Hex,
): Promise<BlockscoutLogItem[]> {
  const allItems: BlockscoutLogItem[] = []
  const seenKeys = new Set<string>()
  let fromBlock = '0'
  let pages = 0

  while (pages < MAX_BLOCKSCOUT_GETLOGS_PAGES) {
    pages += 1
    const params: Record<string, string> = {
      module: 'logs',
      action: 'getLogs',
      address: vaultAddressLower,
      toBlock: 'latest',
      fromBlock,
      topic0: topic0.toLowerCase(),
    }

    const url = new URL(`${blockscoutBaseUrl}/api`)
    for (const [paramKey, value] of Object.entries(params)) {
      url.searchParams.append(paramKey, value)
    }

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(25_000),
    })
    if (!response.ok) {
      throw new Error(`Blockscout getLogs failed: HTTP ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as BlockscoutRpcLogsResponse

    if (data.status !== '1' || !data.result) {
      break
    }

    if (data.result.length === 0) break

    for (const row of data.result) {
      const key = `${row.transactionHash}-${row.logIndex}`
      if (seenKeys.has(key)) continue
      seenKeys.add(key)
      allItems.push(rpcGetLogToBlockscoutLogItem(row))
    }

    const lastBlockNumberHex = data.result[data.result.length - 1].blockNumber
    const lastBlockNumber = parseInt(lastBlockNumberHex, 16).toString()

    if (lastBlockNumber === fromBlock) {
      break
    }

    fromBlock = lastBlockNumber
  }

  return allItems
}

/**
 * Fetches and merges logs for each `topic0` (deduped by tx + log index).
 * Topics are scanned in chunks to limit explorer load; within a chunk, scans run in parallel.
 */
export async function fetchVaultLogsForTopics(
  blockscoutBaseUrl: string,
  vaultAddressLower: string,
  topic0s: Hex[],
): Promise<BlockscoutLogItem[]> {
  if (topic0s.length === 0) {
    return []
  }

  const perTopic: BlockscoutLogItem[][] = []
  for (let i = 0; i < topic0s.length; i += MAX_PARALLEL_BTC_VAULT_TOPIC_SCANS) {
    const chunk = topic0s.slice(i, i + MAX_PARALLEL_BTC_VAULT_TOPIC_SCANS)
    const batch = await Promise.all(
      chunk.map(topic => fetchVaultLogsAllPagesForTopic(blockscoutBaseUrl, vaultAddressLower, topic)),
    )
    perTopic.push(...batch)
  }

  const mergedKeys = new Set<string>()
  const merged: BlockscoutLogItem[] = []
  for (const items of perTopic) {
    for (const item of items) {
      const tx = item.tx_hash ?? ''
      const key = `${tx}-${item.index ?? 0}`
      if (mergedKeys.has(key)) continue
      mergedKeys.add(key)
      merged.push(item)
    }
  }
  return merged
}
