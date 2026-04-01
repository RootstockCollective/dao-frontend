import { useDiscourseTopic } from './useDiscourseTopic'
import { extractVideoUrlFromDiscourseTopic } from '@/lib/video'

/**
 * Hook to extract video URL from a Discourse topic
 * Uses useDiscourseTopic and extracts video URL from details.links
 * Supports: YouTube, Vimeo, Loom, Twitch, Rumble
 */
export function useDiscourseVideo(discourseUrl: string | null | undefined) {
  const topicQuery = useDiscourseTopic(discourseUrl)

  console.log('topicQuery', topicQuery?.data)

  return {
    data: topicQuery.data ? extractVideoUrlFromDiscourseTopic(topicQuery.data) : null,
    isLoading: topicQuery.isLoading,
    error: topicQuery.error,
  }
}
