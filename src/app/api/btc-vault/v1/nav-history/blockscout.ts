import { unstable_cache } from 'next/cache'
import { type Address, decodeEventLog, getAbiItem, type Hex, toEventSelector } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { fetchBlockscoutGetLogsPaginated } from '@/lib/blockscout/fetch-blockscout-get-logs-paginated'
import { RBTC_VAULT_ADDRESS } from '@/lib/constants'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import { paginateSortedBlockscoutNavRows } from './blockscoutPagination'
import type {
  BtcVaultNavDepositRequest,
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavRedeemRequest,
  NavHistoryPagedParams,
} from './types'

type VaultEventName = 'OffchainAssetsReported' | 'DepositRequested' | 'RedeemRequest'

function topic0For(name: VaultEventName): Hex {
  return toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name }))
}

function hexToNumber(hex: string | undefined): number {
  if (hex == null || hex === '') return 0
  return parseInt(hex, 16)
}

/**
 * Subgraph `handleOffchainAssetsReported`: `requestsProcessedInEpoch` is prior epoch `openedRequestCount`
 * (`newEpochId - 1` when `newEpochId > 0`).
 */
export function priorEpochIdForOpenedRequestCount(newEpochId: number): number | null {
  if (newEpochId <= 0) return null
  return newEpochId - 1
}

/**
 * ABI-decodes a Blockscout-shaped log against {@link RBTCAsyncVaultAbi}.
 * Returns `null` when the topic signature, topic count, or data length doesn't match the requested event,
 * so callers can drop malformed rows instead of bucketing them under sentinel addresses/epochs.
 */
function safeDecodeVaultLog<TName extends VaultEventName>(
  log: BackendEventByTopic0ResponseValue,
  eventName: TName,
) {
  const topics = log.topics.filter((t): t is string => t !== null)
  if (topics.length === 0) return null
  try {
    return decodeEventLog({
      abi: RBTCAsyncVaultAbi,
      eventName,
      data: log.data as Hex,
      topics: topics as [Hex, ...Hex[]],
    })
  } catch {
    return null
  }
}

function pushToBucket<K, V>(bucket: Map<K, V[]>, key: K, value: V): void {
  const existing = bucket.get(key)
  if (existing) existing.push(value)
  else bucket.set(key, [value])
}

function buildDepositRequestsByEpoch(
  logs: BackendEventByTopic0ResponseValue[],
): Map<number, BtcVaultNavDepositRequest[]> {
  const byEpoch = new Map<number, BtcVaultNavDepositRequest[]>()
  for (const log of logs) {
    const decoded = safeDecodeVaultLog(log, 'DepositRequested')
    if (!decoded) continue
    const { owner, epochId, assets } = decoded.args
    pushToBucket(byEpoch, Number(epochId), {
      owner: owner.toLowerCase(),
      assets: assets.toString(),
    })
  }
  return byEpoch
}

function buildRedeemRequestsByEpoch(
  logs: BackendEventByTopic0ResponseValue[],
): Map<number, BtcVaultNavRedeemRequest[]> {
  const byEpoch = new Map<number, BtcVaultNavRedeemRequest[]>()
  for (const log of logs) {
    const decoded = safeDecodeVaultLog(log, 'RedeemRequest')
    if (!decoded) continue
    const { owner, epochId, shares } = decoded.args
    pushToBucket(byEpoch, Number(epochId), {
      owner: owner.toLowerCase(),
      shares: shares.toString(),
    })
  }
  return byEpoch
}

export function buildBtcVaultNavHistoryItemsFromBlockscoutLogs(
  navLogs: BackendEventByTopic0ResponseValue[],
  depositLogs: BackendEventByTopic0ResponseValue[],
  redeemLogs: BackendEventByTopic0ResponseValue[],
): BtcVaultNavHistoryItem[] {
  const depositsByEpoch = buildDepositRequestsByEpoch(depositLogs)
  const redeemsByEpoch = buildRedeemRequestsByEpoch(redeemLogs)

  const items: BtcVaultNavHistoryItem[] = []
  for (const log of navLogs) {
    const decoded = safeDecodeVaultLog(log, 'OffchainAssetsReported')
    if (!decoded) continue

    const { newEpochId, reportedOffchainAssets } = decoded.args
    const epochId = Number(newEpochId)
    const prior = priorEpochIdForOpenedRequestCount(epochId)
    const deposits = prior === null ? [] : (depositsByEpoch.get(prior) ?? [])
    const redeems = prior === null ? [] : (redeemsByEpoch.get(prior) ?? [])
    const transactionHash = log.transactionHash.toLowerCase()
    const logIndex = hexToNumber(log.logIndex)

    items.push({
      id: `${transactionHash}-${logIndex}`,
      epochId,
      reportedOffchainAssets: reportedOffchainAssets.toString(),
      processedAt: hexToNumber(log.timeStamp),
      requestsProcessedInEpoch: deposits.length + redeems.length,
      blockNumber: hexToNumber(log.blockNumber),
      transactionHash,
      deposits,
      redeems,
    })
  }
  return items
}

async function fetchAllNavRows(): Promise<BtcVaultNavHistoryItem[]> {
  const address: Address = RBTC_VAULT_ADDRESS

  const [navLogs, depositLogs, redeemLogs] = await Promise.all([
    fetchBlockscoutGetLogsPaginated({
      query: { address, topic0: topic0For('OffchainAssetsReported') },
    }),
    fetchBlockscoutGetLogsPaginated({
      query: { address, topic0: topic0For('DepositRequested') },
    }),
    fetchBlockscoutGetLogsPaginated({
      query: { address, topic0: topic0For('RedeemRequest') },
    }),
  ])

  return buildBtcVaultNavHistoryItemsFromBlockscoutLogs(navLogs, depositLogs, redeemLogs)
}

/**
 * Cache key includes the vault address so different deploys/networks never share entries.
 * Falls back to a literal when the env-derived constant is missing so the module still loads under tests.
 */
const NAV_HISTORY_CACHE_ADDRESS_KEY = String(RBTC_VAULT_ADDRESS ?? 'unset').toLowerCase()

const getCachedNavRows = unstable_cache(
  fetchAllNavRows,
  ['btc-vault-nav-history', 'blockscout', NAV_HISTORY_CACHE_ADDRESS_KEY],
  { revalidate: 20 },
)

export async function fetchBtcVaultNavHistoryPagedFromBlockscout(
  params: NavHistoryPagedParams,
): Promise<BtcVaultNavHistoryPageResult> {
  const allRows = await getCachedNavRows()
  return paginateSortedBlockscoutNavRows(allRows, params)
}
