'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const VIDEO_SRC = '/videos/collective-motion-logo.mp4'
const POSTER_SRC = '/images/collective-motion-logo-poster.webp'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Animated Collective logo. Holds on the poster frame when the viewer asked their system for
 * reduced motion.
 */
export const MotionLogo = ({ className }: { className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

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
    <div className={cn('relative overflow-hidden', className)} data-testid="MotionLogo">
      <video
        ref={videoRef}
        className="size-full object-cover"
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        data-testid="MotionLogoVideo"
      />
    </div>
  )
}
