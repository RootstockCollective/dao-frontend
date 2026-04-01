import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { fetchBlockscoutGetLogsPaginated } from './fetch-blockscout-get-logs-paginated'

vi.mock('@/lib/constants', () => ({
  BLOCKSCOUT_URL: 'https://blockscout.test',
}))

const mockLog = (blockHex: string, logIndex: string, txHash: string) => ({
  address: '0xabc',
  blockNumber: blockHex,
  data: '0x01',
  gasPrice: '0x1',
  gasUsed: '0x1',
  logIndex,
  timeStamp: '0x64',
  topics: ['0xtopic0', '0xtopic1', '0xtopic2'] as (string | null)[],
  transactionHash: txHash,
  transactionIndex: '0x0',
})

describe('fetchBlockscoutGetLogsPaginated', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns raw Blockscout rows with timeStamp preserved', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [mockLog('0xa', '0x0', '0xhash1')],
        }),
    })

    const rows = await fetchBlockscoutGetLogsPaginated({
      query: {
        address: '0xContractAddress',
        topic0: '0xevent_topic',
        // Same as log block (0xa → 10): one page, no second fetch (mock is once-only).
        fromBlock: '10',
      },
    })

    expect(rows).toHaveLength(1)
    expect(rows[0].timeStamp).toBe('0x64')
    expect(rows[0].transactionHash).toBe('0xhash1')
  })

  it('serializes topic2 and topic operator params', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [],
        }),
    })

    await fetchBlockscoutGetLogsPaginated({
      query: {
        address: '0xAddr',
        topic0: '0xt0',
        topic1: '0xt1',
        topic2: '0xt2',
        topic0_1_opr: 'and',
        topic0_2_opr: 'and',
        topic1_2_opr: 'and',
      },
    })

    const calledUrl = new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(calledUrl.searchParams.get('topic2')).toBe('0xt2')
    expect(calledUrl.searchParams.get('topic0_2_opr')).toBe('and')
    expect(calledUrl.searchParams.get('topic1_2_opr')).toBe('and')
  })

  it('merges fetchInit (e.g. Next revalidate) with default timeout', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [],
        }),
    })
    global.fetch = fetchMock

    await fetchBlockscoutGetLogsPaginated({
      query: { address: '0xAddr', topic0: '0xtopic' },
      fetchInit: { next: { revalidate: 60 } },
    })

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      next: { revalidate: 60 },
      signal: expect.any(AbortSignal),
    })
  })

  it('uses blockscoutBaseUrl override', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [],
        }),
    })

    await fetchBlockscoutGetLogsPaginated({
      query: { address: '0xAddr', topic0: '0xt' },
      blockscoutBaseUrl: 'https://custom.explorer/',
    })

    const calledUrl = new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(calledUrl.origin).toBe('https://custom.explorer')
  })
})
