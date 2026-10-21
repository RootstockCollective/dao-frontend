import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/delegate/actions/delegateAction', () => ({
  fetchTotalDelegatedVotes: vi.fn(),
}))

import { fetchTotalDelegatedVotes } from '@/app/delegate/actions/delegateAction'

import { GET } from './route'

describe('GET /api/delegated-votes/v1', () => {
  it('returns the total delegated votes as a decimal string, since bigint is not JSON', async () => {
    vi.mocked(fetchTotalDelegatedVotes).mockResolvedValue(1_234_567_890_123_456_789_012n)

    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ totalDelegatedVotes: '1234567890123456789012' })
  })

  it('returns a generic 500 without the subgraph error or configuration', async () => {
    vi.mocked(fetchTotalDelegatedVotes).mockRejectedValue(
      new Error('Response not successful: Received status code 401'),
    )

    const res = await GET()

    expect(res.status).toBe(500)
    expect(res.headers.get('X-Debug-Info')).toBeNull()
    expect(await res.json()).toEqual({
      success: false,
      error: 'Internal server error',
      errorId: expect.any(String),
    })
  })
})
