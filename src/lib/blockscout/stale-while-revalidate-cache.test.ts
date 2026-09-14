import { describe, expect, it, vi } from 'vitest'

import { StaleWhileRevalidateCache } from './stale-while-revalidate-cache'

const makeCache = <T>(overrides: Partial<ConstructorParameters<typeof StaleWhileRevalidateCache>[0]> = {}) =>
  new StaleWhileRevalidateCache<T>({
    freshMs: 1_000,
    staleMs: 10_000,
    maxEntries: 10,
    enabled: true,
    ...overrides,
  })

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('StaleWhileRevalidateCache', () => {
  it('serves a fresh value without calling the loader again', async () => {
    const cache = makeCache<string>()
    const loader = vi.fn().mockResolvedValue('logs')

    await expect(cache.getOrLoad('k', loader)).resolves.toBe('logs')
    await expect(cache.getOrLoad('k', loader)).resolves.toBe('logs')

    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('collapses concurrent misses into a single load', async () => {
    const cache = makeCache<string>()
    const loader = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'logs'
    })

    const results = await Promise.all([
      cache.getOrLoad('k', loader),
      cache.getOrLoad('k', loader),
      cache.getOrLoad('k', loader),
    ])

    expect(results).toEqual(['logs', 'logs', 'logs'])
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('serves a stale value immediately and refreshes in the background', async () => {
    const cache = makeCache<string>({ freshMs: 0, staleMs: 10_000 })
    const loader = vi.fn().mockResolvedValueOnce('old').mockResolvedValue('new')

    await expect(cache.getOrLoad('k', loader)).resolves.toBe('old')
    // Stale: returns the cached value without waiting for the refresh.
    await expect(cache.getOrLoad('k', loader)).resolves.toBe('old')

    await tick()
    await tick()

    expect(loader).toHaveBeenCalledTimes(2)
    await expect(cache.getOrLoad('k', loader)).resolves.toBe('new')
  })

  it('keeps serving stale data when a background refresh fails', async () => {
    const cache = makeCache<string>({ freshMs: 0, staleMs: 10_000 })
    const loader = vi
      .fn()
      .mockResolvedValueOnce('old')
      .mockRejectedValue(new Error('Blockscout HTTP 429 Too Many Requests'))
    const onError = vi.fn()

    await cache.getOrLoad('k', loader, onError)
    await expect(cache.getOrLoad('k', loader, onError)).resolves.toBe('old')

    await tick()
    await tick()

    expect(onError).toHaveBeenCalled()
    await expect(cache.getOrLoad('k', loader, onError)).resolves.toBe('old')
  })

  it('falls back to an expired value rather than throwing when the loader fails', async () => {
    const cache = makeCache<string>({ freshMs: 0, staleMs: 0 })
    const loader = vi.fn().mockResolvedValueOnce('old').mockRejectedValue(new Error('boom'))
    const onError = vi.fn()

    await cache.getOrLoad('k', loader, onError)
    await new Promise(resolve => setTimeout(resolve, 5))

    await expect(cache.getOrLoad('k', loader, onError)).resolves.toBe('old')
    expect(onError).toHaveBeenCalled()
  })

  it('throws when the loader fails and nothing was ever cached', async () => {
    const cache = makeCache<string>()
    const loader = vi.fn().mockRejectedValue(new Error('boom'))

    await expect(cache.getOrLoad('k', loader)).rejects.toThrow('boom')
  })

  it('evicts the oldest entries past maxEntries', async () => {
    const cache = makeCache<string>({ maxEntries: 2 })
    const loader = (value: string) => vi.fn().mockResolvedValue(value)

    await cache.getOrLoad('a', loader('a'))
    await cache.getOrLoad('b', loader('b'))
    await cache.getOrLoad('c', loader('c'))

    const reloadA = loader('a-again')
    await expect(cache.getOrLoad('a', reloadA)).resolves.toBe('a-again')
    expect(reloadA).toHaveBeenCalledTimes(1)
  })

  it('bypasses caching entirely when disabled', async () => {
    const cache = makeCache<string>({ enabled: false })
    const loader = vi.fn().mockResolvedValue('logs')

    await cache.getOrLoad('k', loader)
    await cache.getOrLoad('k', loader)

    expect(loader).toHaveBeenCalledTimes(2)
  })
})
