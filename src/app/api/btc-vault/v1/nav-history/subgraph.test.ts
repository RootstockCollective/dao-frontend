import { describe, expect, it, vi, beforeEach } from 'vitest'

import { btcVaultClient } from '@/shared/components/ApolloClient'

const { navHistorySubgraphCache } = vi.hoisted(() => ({
  navHistorySubgraphCache: new Map<string, unknown>(),
}))

vi.mock('next/cache', () => ({
  unstable_cache: <T>(fn: () => Promise<T>, keyParts: string[]) => {
    const key = keyParts.join(':')
    return async (): Promise<T> => {
      if (navHistorySubgraphCache.has(key)) {
        return navHistorySubgraphCache.get(key) as T
      }
      const result = await fn()
      navHistorySubgraphCache.set(key, result)
      return result
    }
  },
}))

vi.mock('@/shared/components/ApolloClient', () => ({
  btcVaultClient: {
    query: vi.fn(),
  },
}))

import { fetchBtcVaultNavHistoryPageFromSubgraph, type RawBtcVaultNavHistoryRow } from './subgraph'

const mockQuery = vi.mocked(btcVaultClient.query)

function row(id: string, processedAt: number): RawBtcVaultNavHistoryRow {
  return {
    id,
    epochId: '1',
    reportedOffchainAssets: '100',
    processedAt,
    requestsProcessedInEpoch: '2',
    blockNumber: '1',
    transactionHash: '0xabc',
  }
}

interface RecordedQuery {
  variables?: Record<string, unknown>
  query?: { definitions: ReadonlyArray<{ name?: { value?: string } }> }
}

function asRecordedQuery(args: unknown): RecordedQuery {
  return args as RecordedQuery
}

function operationName(call: RecordedQuery): string | undefined {
  return call.query?.definitions[0]?.name?.value
}

function mockCounterResponse(total: number): void {
  mockQuery.mockResolvedValueOnce({
    error: undefined,
    data: { btcVaultNavHistoryCounter: { total: String(total) } },
  } as Awaited<ReturnType<(typeof btcVaultClient)['query']>>)
}

function mockPageResponse(rows: RawBtcVaultNavHistoryRow[]): void {
  mockQuery.mockResolvedValueOnce({
    error: undefined,
    data: { btcVaultNavHistories: rows },
  } as Awaited<ReturnType<(typeof btcVaultClient)['query']>>)
}

beforeEach(() => {
  mockQuery.mockReset()
  navHistorySubgraphCache.clear()
})

describe('fetchBtcVaultNavHistoryPageFromSubgraph', () => {
  it('pushes first/skip/orderBy/orderDirection to the page query and pulls total from the counter', async () => {
    mockPageResponse([row('0xa1', 30), row('0xa2', 20)])
    mockCounterResponse(42)

    const result = await fetchBtcVaultNavHistoryPageFromSubgraph({
      page: 3,
      limit: 2,
      sort_field: 'processedAt',
      sort_direction: 'desc',
    })

    expect(result.total).toBe(42)
    expect(result.data.map(r => r.id)).toEqual(['0xa1', '0xa2'])
    /** Normalization is still applied to the page payload. */
    expect(result.data[0]?.processedAt).toBe(30)

    const calls = mockQuery.mock.calls.map(([args]) => asRecordedQuery(args))
    const pageCall = calls.find(c => operationName(c) === 'BtcVaultNavHistoryPage')
    const counterCall = calls.find(c => operationName(c) === 'BtcVaultNavHistoryCounterQuery')

    expect(pageCall?.variables).toEqual({
      first: 2,
      skip: 4,
      orderBy: 'processedAt',
      orderDirection: 'desc',
    })
    expect(counterCall?.variables).toEqual({ id: 'global' })
  })

  it('reuses the cached counter across paged requests but issues a fresh page query each time', async () => {
    mockPageResponse([row('0xa1', 30)])
    mockCounterResponse(7)
    mockPageResponse([row('0xa2', 20)])

    const first = await fetchBtcVaultNavHistoryPageFromSubgraph({
      page: 1,
      limit: 1,
      sort_field: 'processedAt',
      sort_direction: 'desc',
    })
    const second = await fetchBtcVaultNavHistoryPageFromSubgraph({
      page: 2,
      limit: 1,
      sort_field: 'processedAt',
      sort_direction: 'desc',
    })

    /** 2 page queries + 1 counter query (cached on first call, reused on second). */
    expect(mockQuery).toHaveBeenCalledTimes(3)
    const ops = mockQuery.mock.calls.map(([args]) => operationName(asRecordedQuery(args)))
    expect(ops.filter(o => o === 'BtcVaultNavHistoryPage')).toHaveLength(2)
    expect(ops.filter(o => o === 'BtcVaultNavHistoryCounterQuery')).toHaveLength(1)

    expect(first.total).toBe(7)
    expect(second.total).toBe(7)
    expect(first.data[0]?.id).toBe('0xa1')
    expect(second.data[0]?.id).toBe('0xa2')
  })

  it('passes the requested sort_field through verbatim (e.g. requestsProcessedInEpoch asc)', async () => {
    mockPageResponse([])
    mockCounterResponse(0)

    await fetchBtcVaultNavHistoryPageFromSubgraph({
      page: 1,
      limit: 25,
      sort_field: 'requestsProcessedInEpoch',
      sort_direction: 'asc',
    })

    const pageCall = mockQuery.mock.calls
      .map(([args]) => asRecordedQuery(args))
      .find(c => operationName(c) === 'BtcVaultNavHistoryPage')

    expect(pageCall?.variables).toMatchObject({
      first: 25,
      skip: 0,
      orderBy: 'requestsProcessedInEpoch',
      orderDirection: 'asc',
    })
  })

  it('treats a missing counter row as total=0 without throwing', async () => {
    mockPageResponse([row('0xa1', 30)])
    mockQuery.mockResolvedValueOnce({
      error: undefined,
      data: { btcVaultNavHistoryCounter: null },
    } as Awaited<ReturnType<(typeof btcVaultClient)['query']>>)

    const result = await fetchBtcVaultNavHistoryPageFromSubgraph({
      page: 1,
      limit: 10,
      sort_field: 'processedAt',
      sort_direction: 'desc',
    })

    expect(result.total).toBe(0)
    expect(result.data).toHaveLength(1)
  })

  it('throws when the page query returns no btcVaultNavHistories field', async () => {
    mockQuery.mockResolvedValueOnce({
      error: undefined,
      data: {},
    } as Awaited<ReturnType<(typeof btcVaultClient)['query']>>)
    mockCounterResponse(0)

    await expect(
      fetchBtcVaultNavHistoryPageFromSubgraph({
        page: 1,
        limit: 10,
        sort_field: 'processedAt',
        sort_direction: 'desc',
      }),
    ).rejects.toThrow(/btcVaultNavHistories/)
  })
})
