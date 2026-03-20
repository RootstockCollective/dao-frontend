import {
  type Address,
  createPublicClient,
  decodeEventLog,
  type DecodeEventLogReturnType,
  getAbiItem,
  getAddress,
  type Hex,
  http,
  toEventSelector,
} from 'viem'
import { rootstock, rootstockTestnet } from 'viem/chains'

import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { RBTC_VAULT_ADDRESS } from '@/lib/constants'
import { type BackendEventByTopic0ResponseValue } from '@/shared/utils'

import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus } from '../types'
import type { BtcVaultHistorySource } from './types'

/** Max paginated getLogs requests per fallback call (same family of API as epoch-history). */
const MAX_BLOCKSCOUT_GETLOGS_PAGES = 200

/**
 * Max concurrent Blockscout `getLogs` topic streams (each topic paginates independently).
 * Avoids opening too many parallel pagination loops against the explorer API.
 */
const MAX_PARALLEL_BTC_VAULT_TOPIC_SCANS = 4

/** Max contracts per `multicall` batch (pairs of pending + claimable per row). */
const MULTICALL_BATCH_SIZE = 128

/** Vault events that produce `BtcVaultHistoryItem` rows (excludes ERC20 `Transfer`, `EpochSettled`, etc.). */
const HISTORY_EVENT_NAMES = [
  'DepositRequest',
  'DepositClaimed',
  'DepositRequestCancelled',
  'NativeDepositRequestCancelled',
  'RedeemRequest',
  'RedeemClaimed',
  'RedeemRequestCancelled',
] as const

/** Maps subgraph-style `DEPOSIT_REQUEST` action to one or more Solidity event names. */
const ACTION_TO_EVENT_NAMES: Record<string, (typeof HISTORY_EVENT_NAMES)[number][]> = {
  DEPOSIT_REQUEST: ['DepositRequest'],
  DEPOSIT_CLAIMED: ['DepositClaimed'],
  DEPOSIT_CANCELLED: ['DepositRequestCancelled', 'NativeDepositRequestCancelled'],
  REDEEM_REQUEST: ['RedeemRequest'],
  REDEEM_CLAIMED: ['RedeemClaimed'],
  REDEEM_CANCELLED: ['RedeemRequestCancelled'],
}

for (const action of ALL_ACTION_TYPES) {
  if (!ACTION_TO_EVENT_NAMES[action]) {
    throw new Error(
      `[btc-vault] Blockscout history: missing ACTION_TO_EVENT_NAMES for schema action "${action}"`,
    )
  }
}

function historyTopic0sAll(): Hex[] {
  return HISTORY_EVENT_NAMES.map(name => toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name })))
}

/**
 * When `type[]` is set, only topic0s for those actions are scanned (intersection with supported history events).
 * Unknown action strings contribute nothing; if none match, returns an empty list (no getLogs calls).
 */
function topic0sForActionFilter(actionFilter: Set<string> | null): Hex[] {
  if (!actionFilter || actionFilter.size === 0) {
    return historyTopic0sAll()
  }
  const topics = new Set<Hex>()
  for (const action of actionFilter) {
    const events = ACTION_TO_EVENT_NAMES[action]
    if (!events) continue
    for (const name of events) {
      topics.add(toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name })))
    }
  }
  return [...topics]
}

export interface BlockscoutLogItem {
  tx_hash?: string
  index?: number
  data?: string
  topics?: string[]
  block_number?: number | string
  /** Unix timestamp in seconds (string or number), when exposed by Blockscout. */
  block_timestamp?: number | string
  timestamp?: number | string
}

/** Blockscout `/api?module=logs&action=getLogs` JSON shape (epoch-history uses the same endpoint). */
export interface BlockscoutRpcLogsResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[] | null
}

function requireBlockscoutUrl(): string {
  const base = (process.env.NEXT_PUBLIC_BLOCKSCOUT_URL ?? '').trim()
  if (!base) {
    throw new Error('NEXT_PUBLIC_BLOCKSCOUT_URL is not configured; cannot fall back for BTC vault history')
  }
  return base.replace(/\/$/, '')
}

function normalizeAddress(value: string | undefined): string {
  if (!value) return ''
  const v = value.toLowerCase()
  return v.startsWith('0x') ? v : `0x${v}`
}

/** Normalizes GET `type` values (`deposit_request`, `DEPOSIT_REQUEST`, `deposit-request`) to subgraph action strings. */
function normalizeHistoryActionType(raw: string): string {
  return raw.trim().toUpperCase().replaceAll('-', '_')
}

/**
 * Maps a Blockscout getLogs row (hex blockNumber / logIndex, topics with nulls) into the shape
 * `tryDecodeLog` expects (aligned with `/api/v2` field names where possible).
 */
export function rpcGetLogToBlockscoutLogItem(log: BackendEventByTopic0ResponseValue): BlockscoutLogItem {
  const topics = log.topics.filter((t): t is string => t !== null)
  const blockNumberHex = log.blockNumber
  const blockNumberDecimal = blockNumberHex.startsWith('0x')
    ? parseInt(blockNumberHex, 16)
    : Number(blockNumberHex)
  const logIndexHex = log.logIndex
  const logIndexDecimal = logIndexHex.startsWith('0x') ? parseInt(logIndexHex, 16) : Number(logIndexHex)

  return {
    tx_hash: log.transactionHash.startsWith('0x') ? log.transactionHash : `0x${log.transactionHash}`,
    data: log.data,
    topics,
    block_number: Number.isFinite(blockNumberDecimal) ? blockNumberDecimal : 0,
    index: Number.isFinite(logIndexDecimal) ? logIndexDecimal : 0,
    timestamp: log.timeStamp ? Number(log.timeStamp) : undefined,
  }
}

function toUnixSeconds(item: BlockscoutLogItem, blockNumber: number): number {
  const raw = item.block_timestamp ?? item.timestamp
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = typeof raw === 'string' ? Number(raw) : raw
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  return blockNumber > 0 ? blockNumber : 0
}

/**
 * Builds a stable history id from tx hash and log index (subgraph-style ids vary; this is unique per log).
 */
function historyId(txHash: string, logIndex: number): string {
  return `${txHash}-${logIndex}`
}

type DecodedVaultEvent = DecodeEventLogReturnType<typeof RBTCAsyncVaultAbi>

/**
 * Maps a decoded vault event to `BtcVaultHistoryItem`, or `null` if the event is not part of user history.
 *
 * `user` must match the subgraph `BtcVaultHistory.user` field: **`controller`**, not owner/receiver
 * (see `rootstockvaults-usdvault` `createBtcVaultHistory` / `requestEntityId(controller, epochId)`).
 */
export function mapDecodedVaultLogToHistoryItem(
  decoded: DecodedVaultEvent,
  context: { txHash: string; logIndex: number; blockNumber: string; timestamp: number },
): BtcVaultHistoryItem | null {
  const { txHash, logIndex, blockNumber, timestamp } = context
  const id = historyId(txHash, logIndex)

  switch (decoded.eventName) {
    case 'DepositRequest': {
      const { controller, requestId, assets } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'DEPOSIT_REQUEST',
        assets: String(assets),
        shares: '0',
        epochId: String(requestId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'NativeDepositRequested':
      // Subgraph updates `isNative` on the existing `BtcDepositRequest` when `DepositRequest` already
      // emitted in the same tx — it does not add a second history row. Skipping avoids duplicate rows.
      return null
    case 'DepositClaimed': {
      const { controller, epochId, assets, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'DEPOSIT_CLAIMED',
        assets: String(assets),
        shares: String(shares),
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'DepositRequestCancelled': {
      const { controller, requestId, assets } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'DEPOSIT_CANCELLED',
        assets: String(assets),
        shares: '0',
        epochId: String(requestId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'NativeDepositRequestCancelled': {
      const { controller, requestId, assets } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'DEPOSIT_CANCELLED',
        assets: String(assets),
        shares: '0',
        epochId: String(requestId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'RedeemRequest': {
      const { controller, requestId, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'REDEEM_REQUEST',
        assets: '0',
        shares: String(shares),
        epochId: String(requestId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'RedeemClaimed': {
      const { controller, epochId, assets, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'REDEEM_CLAIMED',
        assets: String(assets),
        shares: String(shares),
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'RedeemRequestCancelled': {
      const { controller, requestId, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(controller),
        action: 'REDEEM_CANCELLED',
        assets: '0',
        shares: String(shares),
        epochId: String(requestId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    default:
      return null
  }
}

function tryDecodeLog(item: BlockscoutLogItem): BtcVaultHistoryItem | null {
  const topics = item.topics
  const data = item.data
  const txHash = item.tx_hash?.startsWith('0x') ? item.tx_hash : `0x${item.tx_hash ?? ''}`
  if (!topics?.length || !data || !txHash || txHash.length < 10) return null

  const logIndex = typeof item.index === 'number' ? item.index : Number(item.index ?? 0)
  const blockNum = typeof item.block_number === 'number' ? item.block_number : Number(item.block_number ?? 0)
  const blockNumber = Number.isFinite(blockNum) ? String(blockNum) : '0'
  const timestamp = toUnixSeconds(item, blockNum)

  try {
    const decoded = decodeEventLog({
      abi: RBTCAsyncVaultAbi,
      data: data as Hex,
      topics: topics as [Hex, ...Hex[]],
    })
    return mapDecodedVaultLogToHistoryItem(decoded, {
      txHash,
      logIndex: Number.isFinite(logIndex) ? logIndex : 0,
      blockNumber,
      timestamp,
    })
  } catch {
    return null
  }
}

/**
 * Fetches logs for one `topic0` via Blockscout `getLogs` (same API as `fetchEpochSettledLogs`).
 */
async function fetchVaultLogsAllPagesForTopic(
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
      // Blockscout expects lowercase topic hashes (same convention as epoch-history fixtures).
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
 * Topics are scanned in chunks of {@link MAX_PARALLEL_BTC_VAULT_TOPIC_SCANS} to limit explorer load; within a chunk, scans run in parallel.
 */
async function fetchVaultLogsForTopics(
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

/**
 * Fetches vault contract logs from Blockscout (`module=logs&action=getLogs`, same as epoch-history) using **topic0**
 * filters for history events only. When `type[]` is set, only matching event topic0s are requested.
 * Decodes known RBTC vault events, filters, sorts, and returns a page slice plus total matching rows (DAO-2106 fallback).
 *
 * @param params - Same shape as subgraph history query (page/limit/sort/type/address).
 * @returns Items for the requested page and total count of filtered rows (within scan cap).
 */
export async function fetchBtcVaultHistoryFromBlockscout(params: {
  limit: number
  page: number
  sort_field: 'timestamp' | 'assets'
  sort_direction: 'asc' | 'desc'
  type?: string[]
  address?: string
}): Promise<{ items: BtcVaultHistoryItem[]; total: number }> {
  const baseUrl = requireBlockscoutUrl()
  const vaultAddress = normalizeAddress(RBTC_VAULT_ADDRESS)
  if (!vaultAddress || vaultAddress === '0x') {
    throw new Error('RBTC vault address is not configured')
  }

  const actionFilter = params.type?.length ? new Set(params.type.map(normalizeHistoryActionType)) : null

  /** Matches subgraph `btcVaultHistories(where: { user })` — history rows are keyed by **controller**. */
  const userFilter = params.address ? normalizeAddress(params.address) : null

  const topic0s = topic0sForActionFilter(actionFilter)
  const rawItems = await fetchVaultLogsForTopics(baseUrl, vaultAddress, topic0s)
  const collected: BtcVaultHistoryItem[] = []

  for (const raw of rawItems) {
    const row = tryDecodeLog(raw)
    if (!row) continue
    if (actionFilter && !actionFilter.has(row.action)) continue
    if (userFilter && row.user !== userFilter) continue
    collected.push(row)
  }

  const dir = params.sort_direction === 'asc' ? 1 : -1
  collected.sort((a, b) => {
    if (params.sort_field === 'assets') {
      const av = BigInt(a.assets || '0')
      const bv = BigInt(b.assets || '0')
      if (av === bv) return (a.timestamp - b.timestamp) * dir
      return av < bv ? -dir : dir
    }
    if (a.timestamp === b.timestamp) return a.id.localeCompare(b.id) * dir
    return (a.timestamp - b.timestamp) * dir
  })

  const total = collected.length
  const start = (params.page - 1) * params.limit
  const items = collected.slice(start, start + params.limit)

  return { items, total }
}

function requireNodeUrl(): string {
  const url = (process.env.NEXT_PUBLIC_NODE_URL ?? '').trim()
  if (!url) {
    throw new Error('NEXT_PUBLIC_NODE_URL is not configured; cannot enrich BTC vault history from RPC')
  }
  return url
}

function getRootstockLikeChain() {
  const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31)
  const base = id === 30 ? rootstock : rootstockTestnet
  const rpcUrl = requireNodeUrl()
  return {
    ...base,
    rpcUrls: {
      ...base.rpcUrls,
      default: { http: [rpcUrl] },
    },
  }
}

/**
 * Maps on-chain `pending*` / `claimable*` reads to the same `displayStatus` semantics as subgraph
 * enrichment: claimable → ready_to_claim / ready_to_withdraw, pending-only → pending.
 *
 * When both are zero, the request is no longer active on-chain (claimed, cancelled, or never indexed here);
 * we surface **successful** so the row is not stuck on “pending” (indistinguishable from subgraph CANCELLED vs settled without an extra read).
 *
 * @param action - Request row kind (deposit vs redeem)
 * @param pending - `pendingDepositRequest` / `pendingRedeemRequest` result
 * @param claimable - `claimableDepositRequest` / `claimableRedeemRequest` result
 */
export function btcVaultRpcDisplayStatusForRequest(
  action: 'DEPOSIT_REQUEST' | 'REDEEM_REQUEST',
  pending: bigint,
  claimable: bigint,
): BtcVaultHistoryItemWithStatus['displayStatus'] {
  if (claimable > 0n) {
    return action === 'DEPOSIT_REQUEST' ? 'ready_to_claim' : 'ready_to_withdraw'
  }
  if (pending > 0n) {
    return 'pending'
  }
  return 'successful'
}

/**
 * Enriches history rows using vault view calls only (no subgraph). Intended for the Blockscout history path (DAO-2106).
 *
 * - `DEPOSIT_REQUEST` / `REDEEM_REQUEST`: `pending*` + `claimable*` via `multicall`
 * - Claimed / cancelled rows: derived from `action` like the subgraph enricher
 *
 * @throws If `NEXT_PUBLIC_NODE_URL` is missing when any row needs RPC
 */
export async function enrichHistoryWithRpcRequestStatus(
  history: BtcVaultHistoryItem[],
): Promise<BtcVaultHistoryItemWithStatus[]> {
  const needsRpc = history.some(item => item.action === 'DEPOSIT_REQUEST' || item.action === 'REDEEM_REQUEST')
  if (!needsRpc) {
    return history.map((item): BtcVaultHistoryItemWithStatus => {
      const row: BtcVaultHistoryItemWithStatus = { ...item }
      if (item.action === 'DEPOSIT_CLAIMED' || item.action === 'REDEEM_CLAIMED') {
        row.displayStatus = 'successful'
      } else if (item.action === 'DEPOSIT_CANCELLED' || item.action === 'REDEEM_CANCELLED') {
        row.displayStatus = 'cancelled'
      }
      return row
    })
  }

  const chain = getRootstockLikeChain()
  const client = createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]!, { timeout: 25_000 }),
  })
  const vault = getAddress(RBTC_VAULT_ADDRESS)

  interface PairMeta {
    historyIndex: number
    action: 'DEPOSIT_REQUEST' | 'REDEEM_REQUEST'
  }
  const pairMeta: PairMeta[] = []

  const contracts: {
    address: Address
    abi: typeof RBTCAsyncVaultAbi
    functionName:
      | 'pendingDepositRequest'
      | 'claimableDepositRequest'
      | 'pendingRedeemRequest'
      | 'claimableRedeemRequest'
    args: readonly [bigint, Address]
  }[] = []

  for (const [i, element] of history.entries()) {
    const item = element!
    if (item.action === 'DEPOSIT_REQUEST') {
      const requestId = BigInt(item.epochId)
      const controller = getAddress(item.user as Address)
      pairMeta.push({ historyIndex: i, action: 'DEPOSIT_REQUEST' })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'pendingDepositRequest',
        args: [requestId, controller],
      })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'claimableDepositRequest',
        args: [requestId, controller],
      })
    } else if (item.action === 'REDEEM_REQUEST') {
      const requestId = BigInt(item.epochId)
      const controller = getAddress(item.user as Address)
      pairMeta.push({ historyIndex: i, action: 'REDEEM_REQUEST' })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'pendingRedeemRequest',
        args: [requestId, controller],
      })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'claimableRedeemRequest',
        args: [requestId, controller],
      })
    }
  }

  const displayByHistoryIndex = new Map<number, BtcVaultHistoryItemWithStatus['displayStatus']>()

  if (contracts.length > 0) {
    const mcResults = await client.multicall({
      contracts,
      allowFailure: true,
      batchSize: MULTICALL_BATCH_SIZE,
    })

    for (const [p, element] of pairMeta.entries()) {
      const { historyIndex, action } = element!
      const pendingRaw = mcResults[p * 2]
      const claimableRaw = mcResults[p * 2 + 1]
      const pending =
        pendingRaw?.status === 'success' && typeof pendingRaw.result === 'bigint' ? pendingRaw.result : 0n
      const claimable =
        claimableRaw?.status === 'success' && typeof claimableRaw.result === 'bigint'
          ? claimableRaw.result
          : 0n
      displayByHistoryIndex.set(historyIndex, btcVaultRpcDisplayStatusForRequest(action, pending, claimable))
    }
  }

  return history.map((item, index): BtcVaultHistoryItemWithStatus => {
    const row: BtcVaultHistoryItemWithStatus = { ...item }
    if (item.action === 'DEPOSIT_REQUEST' || item.action === 'REDEEM_REQUEST') {
      row.displayStatus = displayByHistoryIndex.get(index) ?? 'pending'
    } else if (item.action === 'DEPOSIT_CLAIMED' || item.action === 'REDEEM_CLAIMED') {
      row.displayStatus = 'successful'
    } else if (item.action === 'DEPOSIT_CANCELLED' || item.action === 'REDEEM_CANCELLED') {
      row.displayStatus = 'cancelled'
    }
    return row
  })
}

export interface GetFromBlockscoutSourceOptions {
  /** Used when RPC status enrichment fails. */
  mapActionOnly: (item: BtcVaultHistoryItem) => BtcVaultHistoryItemWithStatus
}

/**
 * Blockscout history source: logs from Blockscout `getLogs`, `displayStatus` via on-chain `pending*` / `claimable*` multicall.
 */
export function getFromBlockscoutSource(options: GetFromBlockscoutSourceOptions): BtcVaultHistorySource {
  const { mapActionOnly } = options
  return {
    name: 'blockscout',
    fetchPageAndTotal: fetchBtcVaultHistoryFromBlockscout,
    async enrichWithStatus(items: BtcVaultHistoryItem[]) {
      try {
        return await enrichHistoryWithRpcRequestStatus(items)
      } catch (error) {
        console.warn('[btc-vault][DAO-2106] RPC enrichment failed; using action-only displayStatus', error)
        return items.map(mapActionOnly)
      }
    },
  }
}
