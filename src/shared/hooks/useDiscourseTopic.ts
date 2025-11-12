import { useQuery } from '@tanstack/react-query'
import { extractTopicIdFromDiscourseUrl } from '@/lib/discourse'
import type { DiscourseTopicResponse } from '@/shared/types/discourse'

interface UseDiscourseTopicOptions {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}

/**
 * React hook to fetch Discourse topic data
 *
 * @param discourseUrl - The full Discourse topic URL
 * @param options - Query options
 * @returns Query result with Discourse topic data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDiscourseTopic(
 *   'https://gov.rootstockcollective.xyz/t/topic-name/123'
 * )
 * ```
 */
export function useDiscourseTopic(
  discourseUrl: string | null | undefined,
  options: UseDiscourseTopicOptions = {},
) {
  const { enabled = true, staleTime = 5 * 60 * 1000, refetchInterval } = options

  return useQuery<DiscourseTopicResponse, Error>({
    queryKey: ['discourse-topic', discourseUrl],
    queryFn: async () => {
      if (!discourseUrl) {
        throw new Error('Discourse URL is required')
      }

      const topicId = extractTopicIdFromDiscourseUrl(discourseUrl)
      if (!topicId) {
        throw new Error('Invalid Discourse URL format')
      }

      const queryParam = `url=${encodeURIComponent(discourseUrl)}`
      const response = await fetch(`/api/discourse/topic?${queryParam}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || `Failed to fetch Discourse topic: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!discourseUrl,
    staleTime,
    refetchInterval,
  })
}
