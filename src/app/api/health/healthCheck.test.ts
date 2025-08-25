import { afterEach, describe, expect, it, vi } from 'vitest'
import { runHealthCheck } from './healthCheck'
import { getHealthCheckByType } from './healthCheck.utils'

vi.mock('@/app/api/health/healthCheck.utils', () => {
  return {
    getHealthCheckByType: vi.fn(),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

const mockedGetHealthCheckByType = vi.mocked(getHealthCheckByType)

describe('runHealthCheck', {}, () => {
  it('should call getHealthCheckByType function to select type', async () => {
    const expectedFunction = vi.fn()
    mockedGetHealthCheckByType.mockImplementationOnce(type => {
      if (type === 'lastBlockNumber') {
        return expectedFunction
      }
    })

    await runHealthCheck('lastBlockNumber')
    expect(mockedGetHealthCheckByType).toHaveBeenCalledWith('lastBlockNumber')
    expect(expectedFunction).toHaveBeenCalled()
  })

  it('should throw if getHealthCheckByType returns undefined', async () => {
    mockedGetHealthCheckByType.mockImplementationOnce(type => {
      if (type === 'lastBlockNumber') {
        return undefined
      }
    })

    await expect(runHealthCheck('lastBlockNumber')).rejects.toThrow()
  })

  it('should pass any args onto the selected health check', async () => {
    const expectedFunction = vi.fn()
    mockedGetHealthCheckByType.mockImplementationOnce(type => {
      if (type === 'lastBlockNumber') {
        return expectedFunction
      }
    })

    await runHealthCheck('lastBlockNumber', 'foo', 'bar')
    expect(mockedGetHealthCheckByType).toHaveBeenCalledWith('lastBlockNumber')
    expect(expectedFunction).toHaveBeenCalledWith('foo', 'bar')
  })
})
