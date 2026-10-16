import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/viemPublicClient', () => ({
  publicClient: { multicall: vi.fn() },
}))

import { publicClient } from '@/lib/viemPublicClient'

import { GET } from './route'

describe('GET /api/btc-vault/metrics', () => {
  it('returns a generic 500 without the RPC error', async () => {
    vi.mocked(publicClient.multicall).mockRejectedValue(
      new Error('HTTP request failed. URL: https://rpc.example/key Request body: {"method":"eth_call"}'),
    )

    const res = await GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      success: false,
      error: 'Internal server error',
      errorId: expect.any(String),
    })
  })
})
