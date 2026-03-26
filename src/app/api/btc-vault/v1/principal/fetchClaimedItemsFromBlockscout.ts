import { getAbiItem, type Hex, toEventSelector } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { RBTC_VAULT_ADDRESS } from '@/lib/constants'

import { tryDecodeLog } from '../history/sources/blockscout/decode-logs'
import { fetchVaultLogsForTopics } from '../history/sources/blockscout/fetch-logs'
import { normalizeAddress, requireBlockscoutUrl } from '../history/sources/blockscout/utils'
import type { BtcVaultHistoryItem } from '../history/types'

const CLAIMED_EVENT_NAMES = ['DepositClaimed', 'RedeemClaimed'] as const

/**
 * Fetches all DEPOSIT_CLAIMED and REDEEM_CLAIMED events for the given address from Blockscout.
 * Scans DepositClaimed and RedeemClaimed event logs, decodes them, and filters by user address.
 */
export async function fetchClaimedItemsFromBlockscout(address: string): Promise<BtcVaultHistoryItem[]> {
  const baseUrl = requireBlockscoutUrl()
  const vaultAddress = normalizeAddress(RBTC_VAULT_ADDRESS)
  if (!vaultAddress || vaultAddress === '0x') {
    throw new Error('RBTC vault address is not configured')
  }

  const topic0s: Hex[] = CLAIMED_EVENT_NAMES.map(name =>
    toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name })),
  )

  const rawItems = await fetchVaultLogsForTopics(baseUrl, vaultAddress, topic0s)

  const userAddress = normalizeAddress(address)
  const items: BtcVaultHistoryItem[] = []
  for (const raw of rawItems) {
    const row = tryDecodeLog(raw)
    if (!row) continue
    if (row.user !== userAddress) continue
    if (row.action !== 'DEPOSIT_CLAIMED' && row.action !== 'REDEEM_CLAIMED') continue
    items.push(row)
  }

  return items
}
