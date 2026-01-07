import { currentLinks } from './links'

/**
 * Extracts the topic ID from a Discourse URL
 *
 * Discourse URLs follow patterns like:
 * - https://gov.rootstockcollective.xyz/t/topic-name/topic-id
 * - https://gov.rootstockcollective.xyz/t/topic-name/topic-id/post-number
 *
 * @param discourseUrl - The full Discourse URL
 * @returns The topic ID as a number, or null if the URL is invalid
 */
export function extractTopicIdFromDiscourseUrl(discourseUrl: string): number | null {
  try {
    const url = new URL(discourseUrl)

    // Discourse topic URLs follow pattern: /t/topic-name/topic-id or /t/topic-name/topic-id/post-number
    const pathMatch = url.pathname.match(/^\/t\/[^\/]+\/(\d+)/)

    if (pathMatch && pathMatch[1]) {
      const topicId = parseInt(pathMatch[1], 10)
      return isNaN(topicId) ? null : topicId
    }

    return null
  } catch {
    return null
  }
}

/**
 * Gets the Discourse base URL from the current environment
 */
export function getDiscourseBaseUrl(): string {
  return currentLinks.forum
}

/**
 * Builds a Discourse API endpoint URL for a topic
 *
 * @param topicId - The topic ID
 * @returns The full API endpoint URL
 */
export function getDiscourseTopicApiUrl(topicId: number): string {
  const baseUrl = getDiscourseBaseUrl()
  return `${baseUrl}/t/${topicId}.json`
}
