import { describe, it, expect, vi, beforeEach } from 'vitest'
import { encodeAbiParameters, encodeEventTopics } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'

import { fetchEpochSettledLogs, type EpochSettledEvent } from './fetchEpochSettledLogs'

// Mock constants so tests don't depend on env vars
vi.mock('@/lib/constants', () => ({
  BLOCKSCOUT_URL: 'https://blockscout.example.com',
  RBTC_VAULT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
}))

/**
 * Helper: build a Blockscout RPC-style log entry (BackendEventByTopic0ResponseValue)
 * for an EpochSettled event.
 */
function buildBlockscoutLog(
  epochId: bigint,
  reportedOffchainAssets: bigint,
  assets: bigint,
  supply: bigint,
  closedAt: bigint,
  blockNumber: number,
) {
  const topics = encodeEventTopics({
    abi: RBTCAsyncVaultAbi,
    eventName: 'EpochSettled',
    args: { epochId },
  })

  const data = encodeAbiParameters(
    [
      { type: 'uint256', name: 'reportedOffchainAssets' },
      { type: 'uint256', name: 'assets' },
      { type: 'uint256', name: 'supply' },
      { type: 'uint64', name: 'closedAt' },
    ],
    [reportedOffchainAssets, assets, supply, closedAt],
  )

  // Blockscout RPC returns blockNumber as hex string
  const blockNumberHex = `0x${blockNumber.toString(16)}`

  return {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    blockNumber: blockNumberHex,
    data,
    gasPrice: '0x0',
    gasUsed: '0x0',
    logIndex: '0x0',
    timeStamp: '0x0',
    topics: [...topics],
    transactionHash: `0x${'aa'.repeat(32)}`,
    transactionIndex: '0x0',
  }
}

/** Helper: wrap logs in a successful Blockscout RPC response. */
function rpcResponse(logs: ReturnType<typeof buildBlockscoutLog>[]) {
  return { status: '1', message: 'OK', result: logs }
}

describe('fetchEpochSettledLogs', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and decodes EpochSettled events from a single page', async () => {
    const mockLogs = [
      buildBlockscoutLog(0n, 100n, 1000n, 500n, 1700000000n, 100),
      buildBlockscoutLog(1n, 200n, 2000n, 800n, 1700086400n, 200),
    ]

    // Last log is block 200. Pagination re-fetches with fromBlock=200,
    // gets same last block → loop terminates.
    const lastLog = [buildBlockscoutLog(1n, 200n, 2000n, 800n, 1700086400n, 200)]

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rpcResponse(mockLogs)),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rpcResponse(lastLog)),
        }),
    )

    const result = await fetchEpochSettledLogs()

    expect(result).toHaveLength(2)
    // Descending order — epoch 1 first
    expect(result[0].epochId).toBe(1n)
    expect(result[1].epochId).toBe(0n)

    // Verify decoded fields for epoch 1
    expect(result[0]).toEqual<EpochSettledEvent>({
      epochId: 1n,
      reportedOffchainAssets: 200n,
      assets: 2000n,
      supply: 800n,
      closedAt: 1700086400n,
    })

    // Verify decoded fields for epoch 0
    expect(result[1]).toEqual<EpochSettledEvent>({
      epochId: 0n,
      reportedOffchainAssets: 100n,
      assets: 1000n,
      supply: 500n,
      closedAt: 1700000000n,
    })
  })

  it('handles fromBlock-based pagination across multiple pages', async () => {
    const page1Logs = [buildBlockscoutLog(0n, 100n, 1000n, 500n, 1700000000n, 100)]
    const page2Logs = [buildBlockscoutLog(1n, 200n, 2000n, 800n, 1700086400n, 200)]

    const fetchMock = vi
      .fn()
      // First call: fromBlock=0, returns block 100
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rpcResponse(page1Logs)),
      })
      // Second call: fromBlock=100, returns block 200
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rpcResponse(page2Logs)),
      })
      // Third call: fromBlock=200, returns block 200 again (end of pagination)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rpcResponse(page2Logs)),
      })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchEpochSettledLogs()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    // Deduplication removes the overlapping log from page 3
    expect(result).toHaveLength(2)
    // Both epochs present, descending
    expect(result[0].epochId).toBe(1n)

    // Verify fromBlock was forwarded in subsequent requests
    const secondCallUrl = fetchMock.mock.calls[1][0] as string
    expect(secondCallUrl).toContain('fromBlock=100')
  })

  it('returns empty array when Blockscout returns status 0 (no results)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: '0', message: 'No records found', result: [] }),
      }),
    )

    const result = await fetchEpochSettledLogs()
    expect(result).toEqual([])
  })

  it('returns empty array when result is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rpcResponse([])),
      }),
    )

    const result = await fetchEpochSettledLogs()
    expect(result).toEqual([])
  })

  it('throws on Blockscout API HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    await expect(fetchEpochSettledLogs()).rejects.toThrow('Blockscout API error: 500 Internal Server Error')
  })

  it('constructs the correct Blockscout RPC URL with topic0 filter', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(rpcResponse([])),
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchEpochSettledLogs()

    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('blockscout.example.com/api')
    expect(calledUrl).toContain('module=logs')
    expect(calledUrl).toContain('action=getLogs')
    expect(calledUrl).toContain('topic0=0x6511c76b779d65cb4d37d0e41cd72898323cdabc5110af18ebbf47c700946d5f')
  })

  it('deduplicates logs with the same epochId from pagination overlap', async () => {
    // Simulate pagination overlap: epoch 1 appears in both pages
    const page1 = [
      buildBlockscoutLog(0n, 100n, 1000n, 500n, 1700000000n, 100),
      buildBlockscoutLog(1n, 200n, 2000n, 800n, 1700086400n, 200),
    ]
    const page2 = [buildBlockscoutLog(1n, 200n, 2000n, 800n, 1700086400n, 200)]

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rpcResponse(page1)),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rpcResponse(page2)),
        }),
    )

    const result = await fetchEpochSettledLogs()

    // epoch 1 should appear only once
    expect(result).toHaveLength(2)
    expect(result.map(e => e.epochId)).toEqual([1n, 0n])
  })

  it('sorts results descending by epochId', async () => {
    // Blockscout returns logs ordered by block number — last item is block 300
    const mockLogs = [
      buildBlockscoutLog(0n, 100n, 1000n, 500n, 1700000000n, 100),
      buildBlockscoutLog(1n, 200n, 2000n, 800n, 1700086400n, 200),
      buildBlockscoutLog(2n, 300n, 3000n, 1200n, 1700172800n, 300),
    ]

    // Pagination: fromBlock=300 returns same last log → terminates
    const lastLog = [buildBlockscoutLog(2n, 300n, 3000n, 1200n, 1700172800n, 300)]

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rpcResponse(mockLogs)),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rpcResponse(lastLog)),
        }),
    )

    const result = await fetchEpochSettledLogs()

    // Descending by epochId despite ascending block order from Blockscout
    expect(result.map(e => e.epochId)).toEqual([2n, 1n, 0n])
  })
})
