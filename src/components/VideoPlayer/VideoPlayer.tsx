'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'

import { getVideoEmbedConfig } from '@/lib/video'

interface VideoPlayerProps {
  url: string | null | undefined
  className?: string
  'data-testid'?: string
}

function withAutoplay(embedUrl: string): string {
  try {
    const u = new URL(embedUrl)
    u.searchParams.set('autoplay', '1')
    return u.toString()
  } catch {
    return embedUrl
  }
}

/**
 * Video player component that supports multiple video platforms:
 * YouTube, Vimeo, Loom, Twitch
 * Note: Rumble support is temporarily disabled
 */
export const VideoPlayer = ({ url, className, 'data-testid': dataTestId }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!url) {
    return null
  }

  const embedConfig = getVideoEmbedConfig(url)
  if (!embedConfig) {
    return null
  }

  return (
    <div className={className} data-testid={dataTestId}>
      {isPlaying ? (
        <iframe
          src={withAutoplay(embedConfig.embedUrl)}
          title={embedConfig.title}
          allow={embedConfig.allow}
          allowFullScreen
          className="w-full aspect-video rounded"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Play ${embedConfig.platform} video`}
          className="relative w-full aspect-video rounded overflow-hidden bg-black group cursor-pointer"
        >
          {embedConfig.thumbnailUrl && (
            <img
              src={embedConfig.thumbnailUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/90 group-hover:bg-white transition-colors shadow-lg">
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
