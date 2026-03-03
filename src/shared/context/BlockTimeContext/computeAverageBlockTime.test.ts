import { afterEach, describe, expect, it, vi } from 'vitest'

import { computeAverageBlockTime } from './computeAverageBlockTime'

const FALLBACK_BLOCK_TIME_MS = 25_000

describe('computeAverageBlockTime', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fall back to 25s when Blockscout is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const result = await computeAverageBlockTime()

    expect(result).toBe(FALLBACK_BLOCK_TIME_MS)
  })

  it('should fall back to 25s when API returns invalid data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ average_block_time: null }), { status: 200 }),
    )

    const result = await computeAverageBlockTime()

    expect(result).toBe(FALLBACK_BLOCK_TIME_MS)
  })
})
