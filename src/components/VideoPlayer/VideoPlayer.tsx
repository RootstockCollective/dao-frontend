'use client'

import { isYouTubeUrl, extractYouTubeVideoId } from '@/lib/youtube'

interface VideoPlayerProps {
  url: string | null | undefined
  className?: string
  'data-testid'?: string
}

/**
 * Video player component that supports YouTube and can be extended for other platforms
 */
export const VideoPlayer = ({ url, className, 'data-testid': dataTestId }: VideoPlayerProps) => {
  if (!url) {
    return null
  }

  // YouTube support
  if (isYouTubeUrl(url)) {
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return null
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`

    return (
      <div className={className} data-testid={dataTestId}>
        <iframe
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full aspect-video rounded"
        />
      </div>
    )
  }

  // Future: Add support for other video platforms here
  // Example: Vimeo, Dailymotion, etc.

  return null
}
