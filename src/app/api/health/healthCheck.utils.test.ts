import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import mockKnex from 'mock-knex'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getBlockNumber } from 'wagmi/actions'
import { _lastBlockNumber } from './healthCheck.utils'

vi.mock('wagmi/actions', () => ({
  getBlockNumber: vi.fn(),
}))

const getBlockNumberMock = vi.mocked(getBlockNumber)

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
  getBlockNumberMock.mockReset()
})

describe('_lastBlockNumber health check', {}, () => {
  it('should return true if the latest db block number is within acceptable range', {}, async () => {
    const latestBlockNumberOnChain = 12345n
    getBlockNumberMock.mockResolvedValue(latestBlockNumberOnChain)

    tracker.once('query', ({ response }) => {
      response([{ blockNumber: latestBlockNumberOnChain.toString() }])
    })

    const result = await _lastBlockNumber()

    expect(result).toBe(true)
  })

  it('should return false if the latest db block number is outside acceptable range', {}, async () => {
    const latestBlockNumberOnChain = 12345n
    getBlockNumberMock.mockResolvedValue(latestBlockNumberOnChain)

    tracker.once('query', ({ response }) => {
      const tooOld = latestBlockNumberOnChain - BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD) - 10n
      response([{ blockNumber: tooOld.toString() }])
    })

    const result = await _lastBlockNumber()

    expect(result).toBe(false)
  })
})
