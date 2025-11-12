/**
 * TypeScript types for Discourse API responses
 * Minimal types containing only fields used for proposals and videos
 */

export interface DiscourseDetails {
  links?: Array<{
    url?: string
    href?: string
    title?: string
    [key: string]: unknown
  }>
}

/**
 * Discourse topic response - minimal type with only fields we use
 */
export interface DiscourseTopicResponse {
  id: number
  title: string
  fancy_title: string
  created_at: string
  details: DiscourseDetails
}
