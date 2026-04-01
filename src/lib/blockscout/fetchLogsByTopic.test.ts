import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { fetchLogsByTopic } from './fetchLogsByTopic'

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
  timeStamp: '0x1',
  topics: ['0xtopic0', '0xtopic1'],
  transactionHash: txHash,
  transactionIndex: '0x0',
})

describe('fetchLogsByTopic', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fetches logs and converts to RpcLog format', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: [mockLog('0xa', '0x0', '0xhash1')],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: [mockLog('0xa', '0x0', '0xhash1')],
          }),
      })

    const result = await fetchLogsByTopic({
      address: '0xContractAddress',
      topic0: '0xevent_topic',
    })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toEqual({
      address: '0xabc',
      blockHash: null,
      blockNumber: '0xa',
      data: '0x01',
      logIndex: '0x0',
      transactionHash: '0xhash1',
      transactionIndex: '0x0',
      removed: false,
      topics: ['0xtopic0', '0xtopic1'],
    })

    const calledUrl = new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(calledUrl.origin + calledUrl.pathname).toBe('https://blockscout.test/api')
    expect(calledUrl.searchParams.get('module')).toBe('logs')
    expect(calledUrl.searchParams.get('action')).toBe('getLogs')
    expect(calledUrl.searchParams.get('address')).toBe('0xcontractaddress')
    expect(calledUrl.searchParams.get('topic0')).toBe('0xevent_topic')
  })

  it('paginates using fromBlock advancement', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: [mockLog('0xa', '0x0', '0xhash1'), mockLog('0x14', '0x1', '0xhash2')],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: [mockLog('0x14', '0x1', '0xhash2')],
          }),
      })
    global.fetch = fetchMock

    const result = await fetchLogsByTopic({
      address: '0xAddr',
      topic0: '0xtopic',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.data).toHaveLength(2)

    const secondUrl = new URL(fetchMock.mock.calls[1][0])
    expect(secondUrl.searchParams.get('fromBlock')).toBe('20')
  })

  it('deduplicates logs by txHash-logIndex', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: [
              mockLog('0xa', '0x0', '0xhash1'),
              mockLog('0xa', '0x0', '0xhash1'),
              mockLog('0xa', '0x1', '0xhash1'),
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: [mockLog('0xa', '0x1', '0xhash1')],
          }),
      })

    const result = await fetchLogsByTopic({
      address: '0xAddr',
      topic0: '0xtopic',
    })

    expect(result.data).toHaveLength(2)
  })

  it('passes topic1 and topic0_1_opr params when provided', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [],
        }),
    })

    await fetchLogsByTopic({
      address: '0xAddr',
      topic0: '0xtopic0',
      topic1: '0xtopic1',
      topic0_1_opr: 'and',
    })

    const calledUrl = new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(calledUrl.searchParams.get('topic1')).toBe('0xtopic1')
    expect(calledUrl.searchParams.get('topic0_1_opr')).toBe('and')
  })

  it('stops on empty result', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [],
        }),
    })

    const result = await fetchLogsByTopic({
      address: '0xAddr',
      topic0: '0xtopic',
    })

    expect(result.data).toHaveLength(0)
  })

  it('stops on error status from Blockscout', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '0',
          message: 'No records found',
          result: null,
        }),
    })

    await expect(
      fetchLogsByTopic({
        address: '0xAddr',
        topic0: '0xtopic',
      }),
    ).rejects.toThrow('Blockscout error: No records found (status: 0)')
  })

  it('throws on HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(
      fetchLogsByTopic({
        address: '0xAddr',
        topic0: '0xtopic',
      }),
    ).rejects.toThrow('Blockscout getLogs failed: HTTP 500 Internal Server Error')
  })

  it('uses custom fromBlock when provided', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          message: 'OK',
          result: [],
        }),
    })

    await fetchLogsByTopic({
      address: '0xAddr',
      topic0: '0xtopic',
      fromBlock: '5000000',
    })

    const calledUrl = new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(calledUrl.searchParams.get('fromBlock')).toBe('5000000')
  })
})
