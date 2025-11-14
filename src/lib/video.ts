import type { DiscourseDetails, DiscoursePostData, DiscoursePost } from '@/shared/types/discourse'

/**
 * Utilities to extract video URLs from various platforms
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
 * Checks if a URL is a Vimeo URL
 * Supports: vimeo.com/VIDEO_ID, www.vimeo.com/VIDEO_ID
 */
export function isVimeoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    return hostname === 'vimeo.com' || hostname === 'www.vimeo.com'
  } catch {
    return false
  }
}

/**
 * Checks if a URL is a Loom URL
 * Supports: loom.com/share/VIDEO_ID, www.loom.com/share/VIDEO_ID
 */
export function isLoomUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    return (hostname === 'loom.com' || hostname === 'www.loom.com') && urlObj.pathname.startsWith('/share/')
  } catch {
    return false
  }
}

/**
 * Checks if a URL is a Twitch URL
 * Supports: twitch.tv/videos/VIDEO_ID, www.twitch.tv/videos/VIDEO_ID
 */
export function isTwitchUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    return (
      (hostname === 'twitch.tv' || hostname === 'www.twitch.tv') && urlObj.pathname.startsWith('/videos/')
    )
  } catch {
    return false
  }
}

/**
 * Checks if a URL is a Rumble URL
 * Supports: rumble.com/vVIDEO_ID, www.rumble.com/vVIDEO_ID
 */
export function isRumbleUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    return (hostname === 'rumble.com' || hostname === 'www.rumble.com') && /^\/v[\w-]+/.test(urlObj.pathname)
  } catch {
    return false
  }
}

/**
 * Checks if a URL is from any supported video platform
 */
export function isVideoUrl(url: string): boolean {
  return isYouTubeUrl(url) || isVimeoUrl(url) || isLoomUrl(url) || isTwitchUrl(url) || isRumbleUrl(url)
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
 * Extracts Vimeo video ID from Vimeo URL
 * Supports: vimeo.com/VIDEO_ID
 */
export function extractVimeoVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Vimeo URLs: /VIDEO_ID
    const match = pathname.match(/^\/(\d+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Extracts Loom video ID from Loom URL
 * Supports: loom.com/share/VIDEO_ID
 */
export function extractLoomVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Loom URLs: /share/VIDEO_ID
    const match = pathname.match(/^\/share\/([\w-]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Extracts Twitch video ID from Twitch URL
 * Supports: twitch.tv/videos/VIDEO_ID
 */
export function extractTwitchVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Twitch URLs: /videos/VIDEO_ID
    const match = pathname.match(/^\/videos\/(\d+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Extracts Rumble video ID from Rumble URL
 * Supports: rumble.com/vVIDEO_ID or rumble.com/vVIDEO_ID-title.html
 * Returns only the short ID part (e.g., "6upn69" from "v6upn69-title.html")
 * The embed URL format is: https://rumble.com/embed/v{SHORT_ID}/
 */
export function extractRumbleVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Rumble URLs: /vVIDEO_ID or /vVIDEO_ID-title.html
    // Extract only the short ID (alphanumeric characters after 'v' and before the first hyphen)
    const match = pathname.match(/^\/v([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Video platform configuration
 */
export type VideoPlatform = 'youtube' | 'vimeo' | 'loom' | 'twitch' | 'rumble'

interface VideoEmbedConfig {
  embedUrl: string
  title: string
  allow: string
}

/**
 * Gets the embed URL and configuration for a video URL
 * Returns null if the URL is not from a supported platform or video ID cannot be extracted
 */
export function getVideoEmbedConfig(url: string): VideoEmbedConfig | null {
  // YouTube
  if (isYouTubeUrl(url)) {
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) return null
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: 'YouTube video player',
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    }
  }

  // Vimeo
  if (isVimeoUrl(url)) {
    const videoId = extractVimeoVideoId(url)
    if (!videoId) return null
    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      title: 'Vimeo video player',
      allow: 'autoplay; fullscreen; picture-in-picture',
    }
  }

  // Loom
  if (isLoomUrl(url)) {
    const videoId = extractLoomVideoId(url)
    if (!videoId) return null
    return {
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      title: 'Loom video player',
      allow: 'autoplay; fullscreen; picture-in-picture',
    }
  }

  // Twitch
  if (isTwitchUrl(url)) {
    const videoId = extractTwitchVideoId(url)
    if (!videoId) return null
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    return {
      embedUrl: `https://player.twitch.tv/?video=${videoId}&parent=${hostname}`,
      title: 'Twitch video player',
      allow: 'autoplay; fullscreen',
    }
  }

  // Rumble - temporarily disabled
  // Rumble embed IDs differ from video page IDs, requiring server-side fetching
  // TODO: Implement proper Rumble embed ID fetching solution
  // if (isRumbleUrl(url)) {
  //   const videoId = extractRumbleVideoId(url)
  //   if (!videoId) return null
  //   // NOTE: Rumble embed IDs may differ from video page IDs.
  //   // We attempt to use the video ID from the URL, but this may not work for all videos.
  //   // To get the correct embed ID, users need to copy it from Rumble's embed button.
  //   // Rumble embed URL format: https://rumble.com/embed/v{EMBED_ID}/
  //   return {
  //     embedUrl: `https://rumble.com/embed/v${videoId}/`,
  //     title: 'Rumble video player',
  //     allow: 'encrypted-media *; fullscreen *;',
  //   }
  // }

  return null
}

/**
 * Extracts YouTube URL from Discourse topic details.links
 * Returns the first YouTube URL found, or null if none found
 * @deprecated Use extractVideoUrlFromDiscourseTopic instead
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

/**
 * Extracts video URL from post content (HTML)
 * Parses HTML to extract links from <a> tags
 */
function extractVideoUrlFromPostContent(content: string): string | null {
  if (!content) return null

  // Parse HTML and extract links from <a> tags
  // Discourse converts all markdown links to anchor tags, so we only need to check <a> tags
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')
      const links = doc.querySelectorAll('a[href]')

      for (const link of links) {
        const href = link.getAttribute('href')
        if (href && isVideoUrl(href)) {
          return href
        }
      }
    } catch {
      // If DOM parsing fails, return null (shouldn't happen in browser environment)
      return null
    }
  }

  return null
}

/**
 * Type for Discourse topic with post data
 */
export interface DiscourseTopicWithPosts {
  post_stream?: DiscoursePostData // Discourse API returns this as post_stream
  details?: DiscourseDetails
  [key: string]: unknown
}

/**
 * Extracts video URL from Discourse topic
 * First checks post content in postData (from post_stream), then optionally checks details.links
 * Returns the first video URL found from any supported platform, or null if none found
 * Supports: YouTube, Vimeo, Loom, Twitch, Rumble
 */
export function extractVideoUrlFromDiscourseTopic(topic: DiscourseTopicWithPosts): string | null {
  const posts = topic.post_stream?.posts

  if (posts && Array.isArray(posts)) {
    for (const post of posts) {
      // First, check link_counts (pre-extracted by Discourse - faster and more reliable)
      if (post.link_counts && Array.isArray(post.link_counts)) {
        for (const linkCount of post.link_counts) {
          const url = linkCount.url || linkCount.href
          if (typeof url === 'string' && isVideoUrl(url)) {
            return url
          }
        }
      }

      // Fallback: Parse cooked HTML content if link_counts didn't have video URL
      if (post.cooked && typeof post.cooked === 'string') {
        const videoUrl = extractVideoUrlFromPostContent(post.cooked)
        if (videoUrl) return videoUrl
      }

      // Also check raw if available (may require special permissions)
      if (post.raw && typeof post.raw === 'string') {
        const videoUrl = extractVideoUrlFromPostContent(post.raw)
        if (videoUrl) return videoUrl
      }
    }
  }

  // Optionally check details.links if no video found in post content
  const links = topic.details?.links
  if (links && Array.isArray(links)) {
    for (const link of links) {
      const url = link.url || link.href
      if (typeof url === 'string' && isVideoUrl(url)) {
        return url
      }
    }
  }

  return null
}
