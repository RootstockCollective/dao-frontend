import { afterEach, describe, expect, it, vi } from 'vitest'
import { runHealthCheck } from './healthCheck'
import { _checkAll, _lastBlockNumber, getHealthCheckByType } from './healthCheck.utils'

vi.mock('@/app/api/health/healthCheck.utils', () => {
  return {
    _lastBlockNumber: vi.fn(),
    _checkAll: vi.fn(),
    getHealthCheckByType: vi.fn(),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

const mockedGetHealthCheckByType = vi.mocked(getHealthCheckByType)

describe('runHealthCheck', {}, () => {
  it('should call getHealthCheckByType function to select type', async () => {
    mockedGetHealthCheckByType.mockReturnValueOnce(_lastBlockNumber)

    await runHealthCheck('lastBlockNumber')
    expect(mockedGetHealthCheckByType).toHaveBeenCalledWith('lastBlockNumber')
    expect(_checkAll).not.toHaveBeenCalled()
  })
})
