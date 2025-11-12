import type { DiscourseDetails } from '@/shared/types/discourse'

/**
 * Utilities to extract YouTube URLs
 */

/**
 * Checks if a hostname is a YouTube domain (youtube.com or any subdomain)
 */
function isYouTubeDomain(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase()
  return (
    lowerHostname === 'youtube.com' ||
    lowerHostname === 'www.youtube.com' ||
    lowerHostname.endsWith('.youtube.com')
  )
}

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Accept youtube.com, any subdomain of youtube.com, and youtu.be
    const hostname = urlObj.hostname.toLowerCase()
    return isYouTubeDomain(hostname) || hostname === 'youtu.be'
  } catch {
    return false
  }
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    // youtube.com/watch?v=VIDEO_ID
    if (isYouTubeDomain(hostname)) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) {
        return videoId
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      return urlObj.pathname.slice(1) // Remove leading slash
    }

    // youtube.com/embed/VIDEO_ID
    if (isYouTubeDomain(hostname) && urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.split('/embed/')[1]?.split('?')[0] || null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extracts YouTube URL from Discourse topic details.links
 * Returns the first YouTube URL found, or null if none found
 */
export function extractYouTubeUrlFromDiscourseTopic(topic: { details?: DiscourseDetails }): string | null {
  const links = topic.details?.links
  if (!links || !Array.isArray(links)) {
    return null
  }

  for (const link of links) {
    const url = link.url || link.href
    if (typeof url === 'string' && isYouTubeUrl(url)) {
      return url
    }
  }

  return null
}
