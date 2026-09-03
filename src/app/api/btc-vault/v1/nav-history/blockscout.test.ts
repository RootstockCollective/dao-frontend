import { getAbiItem, type Hex, toEventSelector } from 'viem'
import { describe, expect, it } from 'vitest'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import {
  buildBtcVaultNavHistoryItemsFromBlockscoutLogs,
  priorEpochIdForOpenedRequestCount,
} from './blockscout'

const NAV_TOPIC0: Hex = toEventSelector(
  getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'OffchainAssetsReported' }),
)
const DEPOSIT_TOPIC0: Hex = toEventSelector(
  getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'DepositRequested' }),
)
const REDEEM_TOPIC0: Hex = toEventSelector(
  getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'RedeemRequest' }),
)

const UINT256_MAX = (1n << 256n) - 1n

/** ABI-style 32-byte left-padded uint256 hex; bigint preserves full wei range (no Number overflow). */
function padUint256(value: bigint | number): string {
  const bi = typeof value === 'bigint' ? value : BigInt(value)
  if (bi < 0n || bi > UINT256_MAX) {
    throw new RangeError('padUint256: value must be a uint256')
  }
  return `0x${bi.toString(16).padStart(64, '0')}`
}

function padTopicAddress(addr: string): string {
  const hex = addr.replace(/^0x/i, '')
  return `0x${hex.padStart(64, '0')}`
}

/** ABI-encoded `(uint256 assets, bool isNative)` payload for `DepositRequested`. */
function depositData(assetsWei: bigint): string {
  const assets = padUint256(assetsWei).slice(2)
  const isNativeFalse = '0'.repeat(64)
  return `0x${assets}${isNativeFalse}`
}

/** ABI-encoded `(uint256 shares)` payload for `RedeemRequest`. */
function redeemData(sharesWei: bigint): string {
  return padUint256(sharesWei)
}

function baseLog(overrides: Partial<BackendEventByTopic0ResponseValue>): BackendEventByTopic0ResponseValue {
  return {
    address: '0xvault',
    blockNumber: '0x1',
    data: padUint256(0),
    gasPrice: '0x1',
    gasUsed: '0x1',
    logIndex: '0x1',
    timeStamp: '0x64',
    topics: [],
    transactionHash: '0xabc',
    transactionIndex: '0x0',
    ...overrides,
  }
}

describe('padUint256 / depositData / redeemData', () => {
  it('encodes wei-sized bigints without Number precision loss', () => {
    const huge = 9007199254740993n // > Number.MAX_SAFE_INTEGER
    const padded = huge.toString(16).padStart(64, '0')
    expect(padUint256(huge)).toBe(`0x${padded}`)
    expect(depositData(huge)).toBe(`0x${padded}${'0'.repeat(64)}`)
    expect(redeemData(huge)).toBe(`0x${padded}`)
  })
})

describe('priorEpochIdForOpenedRequestCount', () => {
  it('returns null when newEpochId is 0 (subgraph skips prior)', () => {
    expect(priorEpochIdForOpenedRequestCount(0)).toBeNull()
  })

  it('returns newEpochId - 1 for positive epochs', () => {
    expect(priorEpochIdForOpenedRequestCount(1)).toBe(0)
    expect(priorEpochIdForOpenedRequestCount(2)).toBe(1)
    expect(priorEpochIdForOpenedRequestCount(42)).toBe(41)
  })

  it('returns null for negative (defensive)', () => {
    expect(priorEpochIdForOpenedRequestCount(-1)).toBeNull()
  })
})

describe('buildBtcVaultNavHistoryItemsFromBlockscoutLogs', () => {
  const ownerTopic = padTopicAddress('0xd00000000000000000000000000000000000000d')

  it('uses prior-epoch deposits/redeems; row epoch stays newEpochId from NAV log', () => {
    const nav = baseLog({
      topics: [NAV_TOPIC0, padUint256(2)],
      data: padUint256(9_999),
      transactionHash: '0xnavhash',
      logIndex: '0x0',
    })
    const depEpoch1 = baseLog({
      topics: [DEPOSIT_TOPIC0, ownerTopic, padUint256(1)],
      data: depositData(5_000n),
      transactionHash: '0xd1',
      logIndex: '0x1',
    })
    const depEpoch2wrong = baseLog({
      topics: [DEPOSIT_TOPIC0, ownerTopic, padUint256(2)],
      data: depositData(111n),
      transactionHash: '0xd2',
      logIndex: '0x2',
    })

    const [row] = buildBtcVaultNavHistoryItemsFromBlockscoutLogs(
      [nav],
      [depEpoch1, depEpoch2wrong],
      [],
    )

    expect(row.epochId).toBe(2)
    expect(row.requestsProcessedInEpoch).toBe(1)
    expect(row.deposits).toHaveLength(1)
    expect(row.deposits[0]?.assets).toBe('5000')
    expect(row.deposits[0]?.owner).toBe(ownerTopic.slice(0, 2) + ownerTopic.slice(-40))
    expect(row.redeems).toHaveLength(0)
  })

  it('sums deposit + redeem for prior epoch; newEpochId 0 yields empty count', () => {
    const nav0 = baseLog({
      topics: [NAV_TOPIC0, padUint256(0)],
      transactionHash: '0xn0',
    })
    const nav1 = baseLog({
      topics: [NAV_TOPIC0, padUint256(1)],
      transactionHash: '0xn1',
      logIndex: '0xa',
    })
    const dep0 = baseLog({
      topics: [DEPOSIT_TOPIC0, ownerTopic, padUint256(0)],
      data: depositData(100n),
    })
    const red0 = baseLog({
      topics: [REDEEM_TOPIC0, ownerTopic, padUint256(0)],
      data: redeemData(250n),
    })

    const rows = buildBtcVaultNavHistoryItemsFromBlockscoutLogs(
      [nav0, nav1],
      [dep0],
      [red0],
    )

    expect(rows[0]?.epochId).toBe(0)
    expect(rows[0]?.requestsProcessedInEpoch).toBe(0)
    expect(rows[0]?.deposits).toHaveLength(0)
    expect(rows[0]?.redeems).toHaveLength(0)

    expect(rows[1]?.epochId).toBe(1)
    expect(rows[1]?.requestsProcessedInEpoch).toBe(2)
    expect(rows[1]?.deposits).toHaveLength(1)
    expect(rows[1]?.redeems).toHaveLength(1)
    expect(rows[1]?.deposits[0]?.assets).toBe('100')
    expect(rows[1]?.redeems[0]?.shares).toBe('250')
  })

  it('drops malformed logs (missing topics or wrong topic0) instead of bucketing under sentinels', () => {
    const nav = baseLog({
      topics: [NAV_TOPIC0, padUint256(1)],
      data: padUint256(1),
      transactionHash: '0xnav',
    })
    const depNoOwner = baseLog({
      topics: [DEPOSIT_TOPIC0],
      data: depositData(1n),
      transactionHash: '0xd',
    })
    const redWrongTopic0 = baseLog({
      topics: ['0xnotarealsignature', ownerTopic, padUint256(0)],
      data: redeemData(1n),
      transactionHash: '0xr',
    })

    const [row] = buildBtcVaultNavHistoryItemsFromBlockscoutLogs(
      [nav],
      [depNoOwner],
      [redWrongTopic0],
    )

    expect(row.requestsProcessedInEpoch).toBe(0)
    expect(row.deposits).toHaveLength(0)
    expect(row.redeems).toHaveLength(0)
  })

  it('drops a NAV log when its topic signature does not match OffchainAssetsReported', () => {
    const navWrong = baseLog({
      topics: ['0xnotrealnavsig', padUint256(2)],
      data: padUint256(9_999),
      transactionHash: '0xnav',
    })

    const rows = buildBtcVaultNavHistoryItemsFromBlockscoutLogs([navWrong], [], [])
    expect(rows).toHaveLength(0)
  })

  it('produces decimal logIndex in id (matches sibling history `historyId` convention)', () => {
    const nav = baseLog({
      topics: [NAV_TOPIC0, padUint256(1)],
      data: padUint256(1),
      transactionHash: '0xABCDEF',
      logIndex: '0x2a',
    })

    const [row] = buildBtcVaultNavHistoryItemsFromBlockscoutLogs([nav], [], [])
    expect(row.id).toBe('0xabcdef-42')
    expect(row.transactionHash).toBe('0xabcdef')
  })
})
