import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/delegate/actions/delegateAction', () => ({
  fetchContributors: vi.fn(),
}))

import { fetchContributors } from '@/app/delegate/actions/delegateAction'

import { GET } from './route'

describe('GET /api/contributors/v1', () => {
  it('returns a generic 500 without the subgraph error or configuration', async () => {
    vi.mocked(fetchContributors).mockRejectedValue(
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
