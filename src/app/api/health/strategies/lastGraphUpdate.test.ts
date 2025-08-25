import { STATE_SYNC_GRAPH_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { client } from '@/shared/components/ApolloClient'
import { ApolloQueryResult } from '@apollo/client'
import mockKnex from 'mock-knex'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { _lastGraphUpdate } from './lastGraphUpdate'

vi.mock('@/shared/components/ApolloClient', () => {
  return {
    daoClient: {
      query: vi.fn(),
    },
    client: {
      query: vi.fn(),
    },
  }
})

const mockedClientQuery = vi.mocked(client.query)

let tracker: ReturnType<typeof mockKnex.getTracker>

beforeAll(() => {
  mockKnex.mock(db)
  tracker = mockKnex.getTracker()
  tracker.install()
})

afterAll(() => {
  tracker.uninstall()
  mockKnex.unmock(db)
})

afterEach(() => {
  vi.clearAllMocks()
  vi.resetAllMocks()
})

describe('_lastGraphUpdate health check', async () => {
  it('should return true if the latest graph update is within acceptable range', async () => {
    const latestBlockNumberOnGraph = 12345n

    mockedClientQuery.mockResolvedValueOnce({
      data: {
        BlockChangeLog: {
          blockNumber: latestBlockNumberOnGraph.toString(),
        },
      },
      loading: false,
      networkStatus: 7,
      errors: undefined,
    } as ApolloQueryResult<{ BlockChangeLog: { blockNumber: string } }>)

    tracker.once('query', ({ response }) => {
      response([{ blockNumber: latestBlockNumberOnGraph.toString() }])
    })

    const result = await _lastGraphUpdate('tok')

    expect(result).toBe(true)
  })

  it('should return false if the latest graph update is outside acceptable range', async () => {
    const latestBlockNumberOnGraph = 12345n

    mockedClientQuery.mockResolvedValueOnce({
      data: {
        BlockChangeLog: {
          blockNumber: latestBlockNumberOnGraph.toString(),
        },
      },
      loading: false,
      networkStatus: 7,
      errors: undefined,
    } as ApolloQueryResult<{ BlockChangeLog: { blockNumber: string } }>)

    tracker.once('query', ({ response }) => {
      const tooOld = latestBlockNumberOnGraph - BigInt(STATE_SYNC_GRAPH_STALENESS_THRESHOLD) - 1n
      response([{ blockNumber: tooOld.toString() }])
    })

    const result = await _lastGraphUpdate('tok')

    expect(result).toBe(false)
  })
})
