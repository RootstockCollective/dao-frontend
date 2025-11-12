import { useDiscourseTopic } from './useDiscourseTopic'
import { extractYouTubeUrlFromDiscourseTopic } from '@/lib/youtube'

/**
 * Hook to extract YouTube URL from a Discourse topic
 * Uses useDiscourseTopic and extracts YouTube URL from details.links
 */
export function useDiscourseYouTube(discourseUrl: string | null | undefined) {
  const topicQuery = useDiscourseTopic(discourseUrl)

  return {
    data: topicQuery.data ? extractYouTubeUrlFromDiscourseTopic(topicQuery.data) : null,
    isLoading: topicQuery.isLoading,
    error: topicQuery.error,
  }
}
