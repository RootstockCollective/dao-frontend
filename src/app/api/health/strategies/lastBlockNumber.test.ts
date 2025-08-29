import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import mockKnex from 'mock-knex'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getBlockNumber } from 'wagmi/actions'
import { BlockNumberFetchError, UnexpectedBehaviourError } from '../healthCheck.errors'
import { _lastBlockNumber } from './lastBlockNumber'

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
      response([{ number: latestBlockNumberOnChain.toString(), id: 1 }])
    })

    const result = await _lastBlockNumber()

    expect(result).toBe(true)
  })

  it('should return false if the latest db block number is outside acceptable range', {}, async () => {
    const latestBlockNumberOnChain = 12345n
    getBlockNumberMock.mockResolvedValue(latestBlockNumberOnChain)

    tracker.once('query', ({ response }) => {
      const tooOld = latestBlockNumberOnChain - BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD) - 1n
      response([{ number: tooOld.toString(), id: 1 }])
    })

    const result = await _lastBlockNumber()

    expect(result).toBe(false)
  })

  it('should throw an UnexpectedBehaviourError if the lastProcessedBlock id is falsy', {}, async () => {
    const latestBlockNumberOnChain = 12345n
    getBlockNumberMock.mockResolvedValue(latestBlockNumberOnChain)

    tracker.once('query', ({ response }) => {
      response([{ number: latestBlockNumberOnChain.toString(), id: 0 }])
    })

    await expect(_lastBlockNumber()).rejects.toThrow(UnexpectedBehaviourError)
  })

  it('should return false if there is no lastProcessedBlock record', {}, async () => {
    const latestBlockNumberOnChain = 12345n
    getBlockNumberMock.mockResolvedValue(latestBlockNumberOnChain)

    tracker.once('query', ({ response }) => {
      response([])
    })

    const result = await _lastBlockNumber()

    expect(result).toBe(false)
  })

  it('should throw a BlockNumberFetchError if fetching the block number fails', {}, async () => {
    getBlockNumberMock.mockResolvedValue(undefined as any)

    tracker.once('query', ({ response }) => {
      response([{ number: 12345n.toString(), id: 1 }])
    })

    await expect(_lastBlockNumber()).rejects.toThrow(BlockNumberFetchError)
  })
})
