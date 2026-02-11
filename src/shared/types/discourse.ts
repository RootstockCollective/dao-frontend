/**
 * TypeScript types for Discourse API responses
 * Minimal types containing only fields used for proposals and videos
 */

export interface DiscourseDetails {
  links?: Array<{
    url?: string
    href?: string
    title?: string
  }>
}

export interface DiscourseLinkCount {
  url?: string
  href?: string
  internal?: boolean
  reflection?: boolean
  title?: string
  clicks?: number
}

export interface DiscoursePost {
  id?: number
  cooked?: string // HTML content
  raw?: string // Raw markdown/text content
  link_counts?: DiscourseLinkCount[] // Links extracted from the post by Discourse
}

export interface DiscoursePostData {
  posts?: DiscoursePost[]
}

/**
 * Discourse topic response - minimal type with only fields we use
 */
export interface DiscourseTopicResponse {
  id: number
  title: string
  fancy_title: string
  created_at: string
  details?: DiscourseDetails
  post_stream?: DiscoursePostData // Discourse API returns this as post_stream
}
