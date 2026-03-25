import {
  decodeEventLog,
  encodeAbiParameters,
  getAbiItem,
  pad,
  toEventHash,
  toEventSelector,
  toHex,
  type Address,
  type Hex,
} from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'

import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

/** Blockscout-style log payload for `DepositRequested` (viem v2.46+ has no `encodeEventLog` on main export). */
function encodeDepositRequestedLogFixture(args: {
  owner: Address
  epochId: bigint
  assets: bigint
  isNative: boolean
}): { topics: Hex[]; data: Hex } {
  const topic0 = toEventHash('DepositRequested(address,uint256,uint256,bool)')
  const topics: [Hex, Hex, Hex] = [
    topic0,
    pad(args.owner, { size: 32 }),
    pad(toHex(args.epochId, { size: 32 })),
  ]
  const data = encodeAbiParameters(
    [
      { name: 'assets', type: 'uint256' },
      { name: 'isNative', type: 'bool' },
    ],
    [args.assets, args.isNative],
  )
  return { topics, data }
}

function encodeEpochSettledLogFixture(args: {
  epochId: bigint
  reportedOffchainAssets: bigint
  assets: bigint
  supply: bigint
  closedAt: bigint
}): { topics: Hex[]; data: Hex } {
  const topic0 = toEventHash('EpochSettled(uint256,uint256,uint256,uint256,uint64)')
  const topics = [topic0, pad(toHex(args.epochId, { size: 32 }), { size: 32 })] as [Hex, Hex]
  const data = encodeAbiParameters(
    [
      { name: 'reportedOffchainAssets', type: 'uint256' },
      { name: 'assets', type: 'uint256' },
      { name: 'supply', type: 'uint256' },
      { name: 'closedAt', type: 'uint64' },
    ],
    [args.reportedOffchainAssets, args.assets, args.supply, args.closedAt],
  )
  return { topics, data }
}

function encodeEpochFundingProgressLogFixture(args: {
  epochId: bigint
  fundedAssets: bigint
  requiredAssets: bigint
  claimable: boolean
}): { topics: Hex[]; data: Hex } {
  const topic0 = toEventHash('EpochFundingProgress(uint256,uint256,uint256,bool)')
  const topics = [topic0, pad(toHex(args.epochId, { size: 32 }), { size: 32 })] as [Hex, Hex]
  const data = encodeAbiParameters(
    [
      { name: 'fundedAssets', type: 'uint256' },
      { name: 'requiredAssets', type: 'uint256' },
      { name: 'claimable', type: 'bool' },
    ],
    [args.fundedAssets, args.requiredAssets, args.claimable],
  )
  return { topics, data }
}

function encodeRedeemRequestLogFixture(args: {
  owner: Address
  epochId: bigint
  shares: bigint
}): { topics: Hex[]; data: Hex } {
  const topic0 = toEventHash('RedeemRequest(address,uint256,uint256)')
  const topics = [
    topic0,
    pad(args.owner, { size: 32 }),
    pad(toHex(args.epochId, { size: 32 }), { size: 32 }),
  ] as [Hex, Hex, Hex]
  const data = encodeAbiParameters([{ name: 'shares', type: 'uint256' }], [args.shares])
  return { topics, data }
}

const { VAULT_FOR_TEST } = vi.hoisted(() => ({
  VAULT_FOR_TEST: '0x2222222222222222222222222222222222222222',
}))

vi.mock('@/lib/constants', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/constants')>()
  return {
    ...actual,
    RBTC_VAULT_ADDRESS: VAULT_FOR_TEST as typeof actual.RBTC_VAULT_ADDRESS,
  }
})

import {
  btcVaultRpcDisplayStatusForRequest,
  fetchBtcVaultHistoryFromBlockscout,
  mapDecodedVaultLogToHistoryItem,
  type BlockscoutRpcLogsResponse,
} from './blockscout'

describe('mapDecodedVaultLogToHistoryItem', () => {
  it('maps DepositRequested to DEPOSIT_REQUEST row using owner as user', () => {
    const owner = '0x1111111111111111111111111111111111111111' as Address

    const encoded = encodeDepositRequestedLogFixture({
      owner,
      epochId: 5n,
      assets: 10n ** 18n,
      isNative: true,
    })

    const decoded = decodeEventLog({
      abi: RBTCAsyncVaultAbi,
      data: encoded.data,
      topics: encoded.topics as [Hex, ...Hex[]],
    })

    const row = mapDecodedVaultLogToHistoryItem(decoded, {
      txHash: '0xabc',
      logIndex: 2,
      blockNumber: '100',
      timestamp: 1_700_000_000,
    })

    expect(row).toMatchObject({
      user: owner.toLowerCase(),
      action: 'DEPOSIT_REQUEST',
      epochId: '5',
      transactionHash: '0xabc',
      assets: String(10n ** 18n),
      shares: '0',
    })
  })
})

describe('btcVaultRpcDisplayStatusForRequest', () => {
  it('returns open_to_claim when claimable > 0 for deposit', () => {
    expect(btcVaultRpcDisplayStatusForRequest('DEPOSIT_REQUEST', 1n, 2n)).toBe('open_to_claim')
  })

  it('returns claim_pending when claimable > 0 for redeem', () => {
    expect(btcVaultRpcDisplayStatusForRequest('REDEEM_REQUEST', 0n, 1n)).toBe('claim_pending')
  })

  it('returns pending when only pending > 0', () => {
    expect(btcVaultRpcDisplayStatusForRequest('DEPOSIT_REQUEST', 5n, 0n)).toBe('pending')
    expect(btcVaultRpcDisplayStatusForRequest('REDEEM_REQUEST', 3n, 0n)).toBe('pending')
  })

  it('returns successful when both are zero', () => {
    expect(btcVaultRpcDisplayStatusForRequest('DEPOSIT_REQUEST', 0n, 0n)).toBe('successful')
    expect(btcVaultRpcDisplayStatusForRequest('REDEEM_REQUEST', 0n, 0n)).toBe('successful')
  })
})

function makeRpcLogRow(
  overrides: Partial<BackendEventByTopic0ResponseValue>,
): BackendEventByTopic0ResponseValue {
  return {
    address: VAULT_FOR_TEST,
    blockNumber: '0xa',
    data: '0x',
    gasPrice: '0x0',
    gasUsed: '0x0',
    logIndex: '0x0',
    timeStamp: '1800000000',
    topics: [],
    transactionHash: '0x' + 'b'.repeat(64),
    transactionIndex: '0x0',
    ...overrides,
  }
}

describe('fetchBtcVaultHistoryFromBlockscout', () => {
  const originalExplorer = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = 'https://explorer.test'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalExplorer === undefined) {
      delete process.env.NEXT_PUBLIC_BLOCKSCOUT_URL
    } else {
      process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = originalExplorer
    }
  })

  it('throws when NEXT_PUBLIC_BLOCKSCOUT_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_BLOCKSCOUT_URL

    await expect(
      fetchBtcVaultHistoryFromBlockscout({
        limit: 10,
        page: 1,
        sort_field: 'timestamp',
        sort_direction: 'desc',
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_BLOCKSCOUT_URL/)
  })

  it('fetches getLogs, decodes DepositRequested, and returns paginated items', async () => {
    const owner = '0x3333333333333333333333333333333333333333' as Address
    const encoded = encodeDepositRequestedLogFixture({
      owner,
      epochId: 1n,
      assets: 1000n,
      isNative: true,
    })

    const vault = VAULT_FOR_TEST.toLowerCase()

    const rpcRow = makeRpcLogRow({
      data: encoded.data,
      topics: [...encoded.topics, null],
      blockNumber: '0xa',
      logIndex: '0x0',
    })

    const firstPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [rpcRow],
    }
    const endPage: BlockscoutRpcLogsResponse = {
      message: 'No records found',
      status: '0',
      result: null,
    }

    const depositTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'DepositRequested' }),
    ).toLowerCase()

    const depositTopicCalls = { count: 0 }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = new URL(String(input))
        expect(url.pathname).toMatch(/\/api\/?$/)
        expect(url.searchParams.get('module')).toBe('logs')
        expect(url.searchParams.get('action')).toBe('getLogs')
        expect(url.searchParams.get('address')).toBe(vault)
        const topic0 = url.searchParams.get('topic0')?.toLowerCase() ?? ''
        if (topic0 !== depositTopic0) {
          return {
            ok: true,
            json: async () => endPage,
          } as Response
        }
        depositTopicCalls.count += 1
        const payload = depositTopicCalls.count === 1 ? firstPage : endPage
        return {
          ok: true,
          json: async () => payload,
        } as Response
      }),
    )

    const { items, total } = await fetchBtcVaultHistoryFromBlockscout({
      limit: 10,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(total).toBe(1)
    expect(items).toHaveLength(1)
    expect(items[0]?.action).toBe('DEPOSIT_REQUEST')
    expect(items[0]?.user).toBe(owner.toLowerCase())
  })

  it('with type deposit_request only scans the DepositRequested topic (one getLogs stream, paginated)', async () => {
    const owner = '0x3333333333333333333333333333333333333333' as Address
    const encoded = encodeDepositRequestedLogFixture({
      owner,
      epochId: 1n,
      assets: 1000n,
      isNative: true,
    })

    const vault = VAULT_FOR_TEST.toLowerCase()

    const rpcRow = makeRpcLogRow({
      data: encoded.data,
      topics: [...encoded.topics, null],
      blockNumber: '0xa',
      logIndex: '0x0',
    })

    const firstPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [rpcRow],
    }
    const endPage: BlockscoutRpcLogsResponse = {
      message: 'No records found',
      status: '0',
      result: null,
    }

    const depositTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'DepositRequested' }),
    ).toLowerCase()

    const depositTopicCalls = { count: 0 }
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = new URL(String(input))
      expect(url.searchParams.get('address')).toBe(vault)
      const topic0 = url.searchParams.get('topic0')?.toLowerCase() ?? ''
      if (topic0 !== depositTopic0) {
        return {
          ok: true,
          json: async () => endPage,
        } as Response
      }
      depositTopicCalls.count += 1
      const payload = depositTopicCalls.count === 1 ? firstPage : endPage
      return {
        ok: true,
        json: async () => payload,
      } as Response
    })
    vi.stubGlobal('fetch', fetchMock)

    const { items, total } = await fetchBtcVaultHistoryFromBlockscout({
      limit: 10,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      type: ['deposit_request'],
    })

    expect(total).toBe(1)
    expect(items).toHaveLength(1)
    // History fetch scans multiple topics (vault events + EpochSettled + EpochFundingProgress); assert deposit stream ran.
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2)
    const depositTopic = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'DepositRequested' }),
    ).toLowerCase()
    expect(
      fetchMock.mock.calls.some(call => {
        const url = new URL(String(call[0]))
        return url.searchParams.get('topic0')?.toLowerCase() === depositTopic
      }),
    ).toBe(true)
  })

  it('promotes DEPOSIT_REQUEST to DEPOSIT_CLAIMABLE when EpochSettled exists for epochId', async () => {
    const owner = '0x3333333333333333333333333333333333333333' as Address
    const encodedDeposit = encodeDepositRequestedLogFixture({
      owner,
      epochId: 1n,
      assets: 1000n,
      isNative: true,
    })
    const encodedEpochSettled = encodeEpochSettledLogFixture({
      epochId: 1n,
      reportedOffchainAssets: 0n,
      assets: 0n,
      supply: 0n,
      closedAt: 1n,
    })

    const vault = VAULT_FOR_TEST.toLowerCase()
    const depositTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'DepositRequested' }),
    ).toLowerCase()
    const epochSettledTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochSettled' }),
    ).toLowerCase()
    const epochFundingTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochFundingProgress' }),
    ).toLowerCase()

    const depositRpcRow = makeRpcLogRow({
      data: encodedDeposit.data,
      topics: [...encodedDeposit.topics, null],
      blockNumber: '0xa',
      logIndex: '0x0',
    })
    const epochSettledRpcRow = makeRpcLogRow({
      data: encodedEpochSettled.data,
      topics: [...encodedEpochSettled.topics, null],
      blockNumber: '0xb',
      logIndex: '0x0',
    })

    const firstDepositPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [depositRpcRow],
    }
    const firstEpochSettledPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [epochSettledRpcRow],
    }
    const endPage: BlockscoutRpcLogsResponse = {
      message: 'No records found',
      status: '0',
      result: null,
    }

    const calls = { deposit: 0, settled: 0, funding: 0 }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = new URL(String(input))
        expect(url.searchParams.get('address')).toBe(vault)

        const topic0 = url.searchParams.get('topic0')?.toLowerCase() ?? ''
        if (topic0 === depositTopic0) {
          calls.deposit += 1
          const payload = calls.deposit === 1 ? firstDepositPage : endPage
          return { ok: true, json: async () => payload } as Response
        }
        if (topic0 === epochSettledTopic0) {
          calls.settled += 1
          const payload = calls.settled === 1 ? firstEpochSettledPage : endPage
          return { ok: true, json: async () => payload } as Response
        }
        if (topic0 === epochFundingTopic0) {
          calls.funding += 1
          const payload = calls.funding === 1 ? endPage : endPage
          return { ok: true, json: async () => payload } as Response
        }

        return { ok: true, json: async () => endPage } as Response
      }),
    )

    const { items } = await fetchBtcVaultHistoryFromBlockscout({
      limit: 10,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      type: ['deposit_request'],
    })

    expect(items).toHaveLength(1)
    expect(items[0]?.action).toBe('DEPOSIT_CLAIMABLE')
  })

  it('promotes REDEEM_REQUEST to REDEEM_ACCEPTED when EpochSettled exists for epochId', async () => {
    const owner = '0x3333333333333333333333333333333333333333' as Address
    const encodedRedeem = encodeRedeemRequestLogFixture({ owner, epochId: 1n, shares: 2n })
    const encodedEpochSettled = encodeEpochSettledLogFixture({
      epochId: 1n,
      reportedOffchainAssets: 0n,
      assets: 0n,
      supply: 0n,
      closedAt: 1n,
    })

    const vault = VAULT_FOR_TEST.toLowerCase()
    const redeemTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'RedeemRequest' }),
    ).toLowerCase()
    const epochSettledTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochSettled' }),
    ).toLowerCase()
    const epochFundingTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochFundingProgress' }),
    ).toLowerCase()

    const redeemRpcRow = makeRpcLogRow({
      data: encodedRedeem.data,
      topics: [...encodedRedeem.topics, null],
      blockNumber: '0xa',
      logIndex: '0x0',
    })
    const epochSettledRpcRow = makeRpcLogRow({
      data: encodedEpochSettled.data,
      topics: [...encodedEpochSettled.topics, null],
      blockNumber: '0xb',
      logIndex: '0x0',
    })

    const firstRedeemPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [redeemRpcRow],
    }
    const firstEpochSettledPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [epochSettledRpcRow],
    }
    const endPage: BlockscoutRpcLogsResponse = {
      message: 'No records found',
      status: '0',
      result: null,
    }

    const calls = { redeem: 0, settled: 0, funding: 0 }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = new URL(String(input))
        expect(url.searchParams.get('address')).toBe(vault)
        const topic0 = url.searchParams.get('topic0')?.toLowerCase() ?? ''

        if (topic0 === redeemTopic0) {
          calls.redeem += 1
          const payload = calls.redeem === 1 ? firstRedeemPage : endPage
          return { ok: true, json: async () => payload } as Response
        }
        if (topic0 === epochSettledTopic0) {
          calls.settled += 1
          const payload = calls.settled === 1 ? firstEpochSettledPage : endPage
          return { ok: true, json: async () => payload } as Response
        }
        if (topic0 === epochFundingTopic0) {
          calls.funding += 1
          // Funding is not claimable -> stays REDEEM_ACCEPTED
          const payload =
            calls.funding === 1
              ? {
                  message: 'OK',
                  status: '1',
                  result: [
                    makeRpcLogRow({
                      data: encodeEpochFundingProgressLogFixture({
                        epochId: 1n,
                        fundedAssets: 0n,
                        requiredAssets: 0n,
                        claimable: false,
                      }).data,
                      topics: [
                        ...encodeEpochFundingProgressLogFixture({
                          epochId: 1n,
                          fundedAssets: 0n,
                          requiredAssets: 0n,
                          claimable: false,
                        }).topics,
                        null,
                      ],
                      blockNumber: '0xc',
                      logIndex: '0x0',
                    }),
                  ],
                }
              : endPage
          return { ok: true, json: async () => payload } as Response
        }

        return { ok: true, json: async () => endPage } as Response
      }),
    )

    const { items } = await fetchBtcVaultHistoryFromBlockscout({
      limit: 10,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      type: ['redeem_request'],
    })

    expect(items).toHaveLength(1)
    expect(items[0]?.action).toBe('REDEEM_ACCEPTED')
  })

  it('promotes REDEEM_ACCEPTED to REDEEM_CLAIMABLE when EpochFundingProgress has claimable=true', async () => {
    const owner = '0x3333333333333333333333333333333333333333' as Address
    const encodedRedeem = encodeRedeemRequestLogFixture({ owner, epochId: 1n, shares: 2n })
    const encodedEpochSettled = encodeEpochSettledLogFixture({
      epochId: 1n,
      reportedOffchainAssets: 0n,
      assets: 0n,
      supply: 0n,
      closedAt: 1n,
    })
    const encodedEpochFunding = encodeEpochFundingProgressLogFixture({
      epochId: 1n,
      fundedAssets: 0n,
      requiredAssets: 0n,
      claimable: true,
    })

    const vault = VAULT_FOR_TEST.toLowerCase()
    const redeemTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'RedeemRequest' }),
    ).toLowerCase()
    const epochSettledTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochSettled' }),
    ).toLowerCase()
    const epochFundingTopic0 = toEventSelector(
      getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochFundingProgress' }),
    ).toLowerCase()

    const redeemRpcRow = makeRpcLogRow({
      data: encodedRedeem.data,
      topics: [...encodedRedeem.topics, null],
      blockNumber: '0xa',
      logIndex: '0x0',
    })
    const epochSettledRpcRow = makeRpcLogRow({
      data: encodedEpochSettled.data,
      topics: [...encodedEpochSettled.topics, null],
      blockNumber: '0xb',
      logIndex: '0x0',
    })
    const epochFundingRpcRow = makeRpcLogRow({
      data: encodedEpochFunding.data,
      topics: [...encodedEpochFunding.topics, null],
      blockNumber: '0xc',
      logIndex: '0x0',
    })

    const firstRedeemPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [redeemRpcRow],
    }
    const firstEpochSettledPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [epochSettledRpcRow],
    }
    const firstEpochFundingPage: BlockscoutRpcLogsResponse = {
      message: 'OK',
      status: '1',
      result: [epochFundingRpcRow],
    }
    const endPage: BlockscoutRpcLogsResponse = {
      message: 'No records found',
      status: '0',
      result: null,
    }

    const calls = { redeem: 0, settled: 0, funding: 0 }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = new URL(String(input))
        expect(url.searchParams.get('address')).toBe(vault)
        const topic0 = url.searchParams.get('topic0')?.toLowerCase() ?? ''

        if (topic0 === redeemTopic0) {
          calls.redeem += 1
          const payload = calls.redeem === 1 ? firstRedeemPage : endPage
          return { ok: true, json: async () => payload } as Response
        }
        if (topic0 === epochSettledTopic0) {
          calls.settled += 1
          const payload = calls.settled === 1 ? firstEpochSettledPage : endPage
          return { ok: true, json: async () => payload } as Response
        }
        if (topic0 === epochFundingTopic0) {
          calls.funding += 1
          const payload = calls.funding === 1 ? firstEpochFundingPage : endPage
          return { ok: true, json: async () => payload } as Response
        }

        return { ok: true, json: async () => endPage } as Response
      }),
    )

    const { items } = await fetchBtcVaultHistoryFromBlockscout({
      limit: 10,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      type: ['redeem_request'],
    })

    expect(items).toHaveLength(1)
    expect(items[0]?.action).toBe('REDEEM_CLAIMABLE')
  })
})
