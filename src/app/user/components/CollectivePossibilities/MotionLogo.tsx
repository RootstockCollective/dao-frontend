'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const VIDEO_SRC = '/videos/collective-motion-logo.mp4'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Animated Collective logo, laid over the art underneath it (see PosterArt).
 *
 * The video stays transparent until it is actually playing and then fades in, so a slow
 * connection never shows a grey frame or native controls, and a refused autoplay or a
 * reduced-motion preference simply leaves the poster in place.
 */
export const MotionLogo = ({ className }: { className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const query = window.matchMedia?.(REDUCED_MOTION_QUERY)

    const sync = () => {
      if (query?.matches) {
        video.pause()
        return
      }
      // Autoplay can still be refused (data saver, battery saver); the poster stays up then
      Promise.resolve(video.play()).catch(() => {})
    }

    sync()
    query?.addEventListener?.('change', sync)

    return () => query?.removeEventListener?.('change', sync)
  }, [])

  return (
    <video
      ref={videoRef}
      className={cn(
        'absolute inset-0 block size-full bg-transparent object-cover opacity-0',
        'transition-opacity duration-400 ease-[cubic-bezier(0.22,0.61,0.36,1)]',
        isPlaying && 'opacity-100',
        className,
      )}
      src={VIDEO_SRC}
      loop
      muted
      playsInline
      preload="metadata"
      tabIndex={-1}
      aria-hidden="true"
      onPlaying={() => setIsPlaying(true)}
      data-testid="MotionLogoVideo"
    />
  )
}
