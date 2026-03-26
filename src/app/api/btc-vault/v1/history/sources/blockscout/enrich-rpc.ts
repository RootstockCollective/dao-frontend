import { type Address, createPublicClient, getAddress, http } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { RBTC_VAULT_ADDRESS } from '@/lib/constants'

import { mapActionToDisplayStatus } from '../../mapActionToDisplayStatus'
import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus } from '../../types'
import { MULTICALL_BATCH_SIZE } from './constants'
import { getRootstockLikeChain } from './utils'

/**
 * Maps on-chain `pending*` / `claimable*` reads to the same `displayStatus` semantics as subgraph
 * enrichment: claimable -> open_to_claim / claim_pending, pending-only -> pending.
 *
 * When both are zero, the request is no longer active on-chain (claimed, cancelled, or never indexed here);
 * we surface **successful** so the row is not stuck on "pending".
 */
export function btcVaultRpcDisplayStatusForRequest(
  action: 'DEPOSIT_REQUEST' | 'REDEEM_REQUEST',
  pending: bigint,
  claimable: bigint,
): BtcVaultHistoryItemWithStatus['displayStatus'] {
  if (claimable > 0n) {
    return action === 'DEPOSIT_REQUEST' ? 'open_to_claim' : 'claim_pending'
  }
  if (pending > 0n) {
    return 'pending'
  }
  return 'successful'
}

function itemNeedsVaultBalanceRpc(item: BtcVaultHistoryItem): boolean {
  if ((item as BtcVaultHistoryItemWithStatus).displayStatus) return false
  return (
    item.action === 'DEPOSIT_REQUEST' ||
    item.action === 'DEPOSIT_CLAIMABLE' ||
    item.action === 'REDEEM_REQUEST' ||
    item.action === 'REDEEM_CLAIMABLE'
  )
}

/**
 * Enriches history rows using vault view calls only (no subgraph). Intended for the Blockscout history path (DAO-2106).
 *
 * - Items with a pre-set `displayStatus` (e.g. cancelled requests) are passed through unchanged.
 * - `DEPOSIT_REQUEST` / `DEPOSIT_CLAIMABLE` / `REDEEM_REQUEST` / `REDEEM_CLAIMABLE` without a pre-set status:
 *   `pending*` + `claimable*` via `multicall` (promoted actions need the same reads as base requests).
 * - `REDEEM_ACCEPTED`: `displayStatus` from `mapActionToDisplayStatus` (typically `approved`) without RPC.
 * - Other rows: derived from `action` via shared `mapActionToDisplayStatus`
 *
 * @throws If `NEXT_PUBLIC_NODE_URL` is missing when any row needs RPC
 */
export async function enrichHistoryWithRpcRequestStatus(
  history: BtcVaultHistoryItem[],
): Promise<BtcVaultHistoryItemWithStatus[]> {
  const needsRpc = history.some(itemNeedsVaultBalanceRpc)
  if (!needsRpc) {
    return history.map((item): BtcVaultHistoryItemWithStatus => {
      const preSet = (item as BtcVaultHistoryItemWithStatus).displayStatus
      if (preSet) return { ...item, displayStatus: preSet }
      return { ...item, displayStatus: mapActionToDisplayStatus(item.action) }
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
    /** Same branch as `btcVaultRpcDisplayStatusForRequest` first argument */
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
    args: readonly [Address]
  }[] = []

  for (const [i, element] of history.entries()) {
    const item = element!
    if (!itemNeedsVaultBalanceRpc(item)) continue

    const owner = getAddress(item.user as Address)
    if (item.action === 'DEPOSIT_REQUEST' || item.action === 'DEPOSIT_CLAIMABLE') {
      pairMeta.push({ historyIndex: i, action: 'DEPOSIT_REQUEST' })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'pendingDepositRequest',
        args: [owner],
      })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'claimableDepositRequest',
        args: [owner],
      })
    } else if (item.action === 'REDEEM_REQUEST' || item.action === 'REDEEM_CLAIMABLE') {
      pairMeta.push({ historyIndex: i, action: 'REDEEM_REQUEST' })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'pendingRedeemRequest',
        args: [owner],
      })
      contracts.push({
        address: vault,
        abi: RBTCAsyncVaultAbi,
        functionName: 'claimableRedeemRequest',
        args: [owner],
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
    const preSet = (item as BtcVaultHistoryItemWithStatus).displayStatus
    if (preSet) return { ...item, displayStatus: preSet }
    if (
      item.action === 'DEPOSIT_REQUEST' ||
      item.action === 'DEPOSIT_CLAIMABLE' ||
      item.action === 'REDEEM_REQUEST' ||
      item.action === 'REDEEM_CLAIMABLE'
    ) {
      return { ...item, displayStatus: displayByHistoryIndex.get(index) ?? 'pending' }
    }
    return { ...item, displayStatus: mapActionToDisplayStatus(item.action) }
  })
}
