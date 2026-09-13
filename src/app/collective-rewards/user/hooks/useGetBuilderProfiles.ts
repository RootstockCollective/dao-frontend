import { useQuery } from '@tanstack/react-query'

import type { BuilderProfileData, BuilderProfilesResponse } from '@/app/api/builder-profiles/route'

/** Curated builder configuration changes rarely, so it is cached for the session. */
const STALE_TIME = 5 * 60 * 1000

/**
 * Fetches the curated builder configuration (icons today, richer profiles later),
 * keyed by lowercased builder address.
 *
 * This runs in parallel with the on-chain reads in `useGetBuilders`, which are the
 * real bottleneck for the builder list, so it adds no latency to the critical path.
 * A failure here is not fatal: builders fall back to their generated identicon.
 */
export const useGetBuilderProfiles = () => {
  const { data, isLoading, error } = useQuery<Record<string, BuilderProfileData>, Error>({
    queryKey: ['builderProfiles'],
    queryFn: async () => {
      const response = await fetch('/api/builder-profiles')
      if (!response.ok) {
        throw new Error('Failed to fetch builder profiles')
      }
      const json: BuilderProfilesResponse = await response.json()
      return json.profiles ?? {}
    },
    staleTime: STALE_TIME,
  })

  return { data: data ?? {}, isLoading, error }
}
