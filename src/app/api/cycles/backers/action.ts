import { unstable_cache } from 'next/cache'

import { BackersPerCycleRow, buildBackersPerCycleQuery } from './query'

export const BACKERS_PER_CYCLE_CACHE_TAG = 'cached_cycles_backers'

/**
 * Settled cycles never change, and the running cycle's count only moves when someone
 * allocates, so minutes of staleness are invisible here.
 */
export const BACKERS_PER_CYCLE_REVALIDATE_SECONDS = 300

const fetchBackersPerCycle = async (limit: number): Promise<BackersPerCycleRow[]> => {
  const result = await buildBackersPerCycleQuery(limit)
  return (result?.rows ?? []) as BackersPerCycleRow[]
}

/**
 * The query walks the whole allocation history, so it must not run once per request.
 *
 * `export const revalidate` on the route handler cannot do this: reading the request's URL
 * opts a handler out of the full-route cache entirely, which left every poll from every open
 * tab hitting the database through a five-connection pool. Caching the data function instead
 * is independent of how the handler reads its params, and `limit` is part of the cache key.
 */
export const getCachedBackersPerCycle = unstable_cache(fetchBackersPerCycle, [BACKERS_PER_CYCLE_CACHE_TAG], {
  revalidate: BACKERS_PER_CYCLE_REVALIDATE_SECONDS,
  tags: [BACKERS_PER_CYCLE_CACHE_TAG],
})
