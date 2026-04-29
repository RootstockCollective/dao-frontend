import { unstable_cache } from 'next/cache'
import { type Address, getAbiItem, type Hex, toEventSelector } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { fetchBlockscoutGetLogsPaginated } from '@/lib/blockscout/fetch-blockscout-get-logs-paginated'
import { RBTC_VAULT_ADDRESS } from '@/lib/constants'

import type {
  BtcVaultNavDepositRequest,
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavRedeemRequest,
} from './types'

type VaultEventName = 'OffchainAssetsReported' | 'DepositRequested' | 'RedeemRequest'

function topic0For(name: VaultEventName): Hex {
  return toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name }))
}

function hexToNumber(hex: string): number {
  return parseInt(hex, 16)
}

function topicToAddress(topic: string | null | undefined): string {
  if (!topic) return '0x'
  return ('0x' + topic.slice(-40)).toLowerCase()
}

function firstUint256FromData(data: string): string {
  return BigInt('0x' + data.slice(2, 66)).toString()
}

async function fetchAllNavRows(): Promise<BtcVaultNavHistoryItem[]> {
  const address = RBTC_VAULT_ADDRESS as Address

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

  const depositsByEpoch = new Map<number, BtcVaultNavDepositRequest[]>()
  for (const log of depositLogs) {
    const epochId = hexToNumber(log.topics[2] ?? '0x0')
    const entry: BtcVaultNavDepositRequest = {
      owner: topicToAddress(log.topics[1]),
      assets: firstUint256FromData(log.data),
    }
    const existing = depositsByEpoch.get(epochId)
    if (existing) existing.push(entry)
    else depositsByEpoch.set(epochId, [entry])
  }

  const redeemsByEpoch = new Map<number, BtcVaultNavRedeemRequest[]>()
  for (const log of redeemLogs) {
    const epochId = hexToNumber(log.topics[2] ?? '0x0')
    const entry: BtcVaultNavRedeemRequest = {
      owner: topicToAddress(log.topics[1]),
      shares: firstUint256FromData(log.data),
    }
    const existing = redeemsByEpoch.get(epochId)
    if (existing) existing.push(entry)
    else redeemsByEpoch.set(epochId, [entry])
  }

  const rows: BtcVaultNavHistoryItem[] = navLogs.map(log => {
    const epochId = hexToNumber(log.topics[1] ?? '0x0')
    const deposits = depositsByEpoch.get(epochId) ?? []
    const redeems = redeemsByEpoch.get(epochId) ?? []
    return {
      id: `${log.transactionHash}-${log.logIndex}`,
      epochId,
      reportedOffchainAssets: BigInt(log.data).toString(),
      processedAt: hexToNumber(log.timeStamp),
      requestsProcessed: deposits.length + redeems.length,
      blockNumber: hexToNumber(log.blockNumber),
      transactionHash: log.transactionHash.toLowerCase(),
      deposits,
      redeems,
    }
  })

  rows.sort((a, b) => b.processedAt - a.processedAt)
  return rows
}

const getCachedNavRows = unstable_cache(fetchAllNavRows, ['btc-vault-nav-history', 'blockscout'], {
  revalidate: 20,
})

export async function fetchBtcVaultNavHistoryPageFromBlockscout(): Promise<BtcVaultNavHistoryPageResult> {
  const rows = await getCachedNavRows()
  return { data: rows, total: rows.length }
}
