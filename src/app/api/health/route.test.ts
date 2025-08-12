import { runHealthCheck } from '@/app/api/health/healthCheck'
import { GET } from './route'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WrongHealthCheckTypeError } from './healthCheck.errors'

vi.mock('@/app/api/health/healthCheck', () => ({
  runHealthCheck: vi.fn(() => Promise.resolve(true)),
}))

const mockedRunHealthCheck = vi.mocked(runHealthCheck)

beforeEach(() => {
  mockedRunHealthCheck.mockReset()
})

describe(
  'GET /api/health/',
  {
    concurrent: true,
  },
  () => {
    it('should return 500 for an invalid health check type', {}, async () => {
      mockedRunHealthCheck.mockImplementationOnce(() =>
        Promise.reject(new WrongHealthCheckTypeError('invalidType')),
      )
      const req = new Request('http://localhost/api/health')
      const response = await GET(req, { params: Promise.resolve({ type: 'invalidType' as any }) })

      expect(response.status).toBe(400)
    })

    it('should return WrongHealthCheckTypeError for an invalid health check type', {}, async () => {
      mockedRunHealthCheck.mockImplementationOnce(() =>
        Promise.reject(new WrongHealthCheckTypeError('invalidType')),
      )
      const req = new Request('http://localhost/api/health')
      const response = await GET(req, { params: Promise.resolve({ type: 'invalidType' as any }) })
      const data = await response.json()

      expect(data.error).toBe(new WrongHealthCheckTypeError('invalidType').message)
    })

    it('should return 200 for all health check types if no type is specified', {}, async () => {
      const req = new Request('http://localhost/api/health')
      const response = await GET(req, { params: Promise.resolve({}) })

      expect(response.status).toBe(200)
    })

    it('should pass a health check type', {}, async () => {
      const req = new Request('http://localhost/api/health')
      const response = await GET(req, { params: Promise.resolve({ type: 'lastBlockNumber' }) })

      expect(response.status).toBe(200)
      expect(mockedRunHealthCheck).toHaveBeenCalledWith('lastBlockNumber')
    })
  },
)
