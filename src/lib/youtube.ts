import type { DiscourseDetails } from '@/shared/types/discourse'

/**
 * Utilities to extract YouTube URLs
 */

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Accept youtube.com, any subdomain of youtube.com, and youtu.be
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtu.be'
    );
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

    // youtube.com/watch?v=VIDEO_ID
    {
      const hostname = urlObj.hostname.toLowerCase();
      if (
        (hostname === 'youtube.com' ||
          hostname === 'www.youtube.com' ||
          hostname.endsWith('.youtube.com')) &&
        urlObj.searchParams.has('v')
      ) {
        return urlObj.searchParams.get('v');
      }
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1) // Remove leading slash
    }

    // youtube.com/embed/VIDEO_ID
    {
      const hostname = urlObj.hostname.toLowerCase();
      if (
        (hostname === 'youtube.com' ||
          hostname === 'www.youtube.com' ||
          hostname.endsWith('.youtube.com')) &&
        urlObj.pathname.startsWith('/embed/')
      ) {
        return urlObj.pathname.split('/embed/')[1]?.split('?')[0] || null;
      }
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
