'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'

const VIDEO_SRC = '/videos/collective-motion-logo.mp4'

/**
 * Animated Collective logo, laid over the art underneath it (see PosterArt).
 *
 * The video stays transparent until it is actually playing and fades back out when it stops, so a
 * slow connection never shows a grey frame or native controls, and a refused autoplay or a
 * reduced-motion preference simply leaves the poster in place.
 *
 * It only loads and plays while it is on screen. A layout that hides it (display: none, as the
 * narrow Don't Miss strip does) never intersects, so it downloads nothing, and the loop stops
 * once the page scrolls it away.
 */
export const MotionLogo = ({ className }: { className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  // Without an observer there is no telling, so the video plays as it always did
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined')
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldPlay = isInView && !prefersReducedMotion

  useEffect(() => {
    const video = videoRef.current
    if (!video || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting))
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!shouldPlay) {
      video.pause()
      return
    }
    // Autoplay can still be refused (data saver, battery saver); the poster stays up then
    Promise.resolve(video.play()).catch(() => {})
  }, [shouldPlay])

  return (
    <video
      ref={videoRef}
      className={cn(
        'absolute inset-0 block size-full bg-transparent object-cover opacity-0',
        'transition-opacity duration-400 ease-out-cubic',
        isPlaying && 'opacity-100',
        className,
      )}
      src={VIDEO_SRC}
      loop
      muted
      playsInline
      preload="none"
      tabIndex={-1}
      aria-hidden="true"
      onPlaying={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      data-testid="MotionLogoVideo"
    />
  )
}
