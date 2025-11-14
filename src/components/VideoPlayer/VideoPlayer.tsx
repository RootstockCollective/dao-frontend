'use client'

import { getVideoEmbedConfig } from '@/lib/video'

interface VideoPlayerProps {
  url: string | null | undefined
  className?: string
  'data-testid'?: string
}

/**
 * Video player component that supports multiple video platforms:
 * YouTube, Vimeo, Loom, Twitch, and Rumble
 */
export const VideoPlayer = ({ url, className, 'data-testid': dataTestId }: VideoPlayerProps) => {
  if (!url) {
    return null
  }

  const embedConfig = getVideoEmbedConfig(url)
  if (!embedConfig) {
    return null
  }

  return (
    <div className={className} data-testid={dataTestId}>
      <iframe
        src={embedConfig.embedUrl}
        title={embedConfig.title}
        allow={embedConfig.allow}
        allowFullScreen
        className="w-full aspect-video rounded"
      />
    </div>
  )
}
