import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { logError } = vi.hoisted(() => ({ logError: vi.fn() }))

vi.mock('@/lib/logger', () => ({
  logger: { child: () => ({ error: logError }) },
}))

import { handleApiError } from './helpers'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('handleApiError', () => {
  beforeEach(() => {
    logError.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns a generic 500 with the id the error was logged under', async () => {
    const err = new Error('select * from "Table" - connect ECONNREFUSED 10.0.0.1:5432')

    const res = handleApiError(err, 'test route')
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: 'Internal server error',
      errorId: expect.stringMatching(UUID),
    })
    expect(logError).toHaveBeenCalledWith(
      { err, context: 'test route', errorId: body.errorId },
      'Error in test route',
    )
  })

  it('omits the error details in development too', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const body = await handleApiError(new TypeError('boom')).json()

    expect(Object.keys(body).sort()).toEqual(['error', 'errorId', 'success'])
  })

  it('logs a different id for each error', async () => {
    const first = await handleApiError(new Error('a')).json()
    const second = await handleApiError(new Error('b')).json()

    expect(first.errorId).not.toBe(second.errorId)
    expect(logError).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ errorId: second.errorId }),
      'API error',
    )
  })
})
