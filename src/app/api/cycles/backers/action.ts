import { unstable_cache } from 'next/cache'

import { BackersPerCycleRow, buildBackersPerCycleQuery } from './query'

export const BACKERS_PER_CYCLE_CACHE_TAG = 'cached_cycles_backers'

export const BACKERS_PER_CYCLE_REVALIDATE_SECONDS = 300

const fetchBackersPerCycle = async (): Promise<BackersPerCycleRow[]> => {
  const result = await buildBackersPerCycleQuery()
  return (result?.rows ?? []) as BackersPerCycleRow[]
}

/** The query walks the whole allocation history, so it must not run once per request. */
export const getCachedBackersPerCycle = unstable_cache(fetchBackersPerCycle, [BACKERS_PER_CYCLE_CACHE_TAG], {
  revalidate: BACKERS_PER_CYCLE_REVALIDATE_SECONDS,
  tags: [BACKERS_PER_CYCLE_CACHE_TAG],
})
