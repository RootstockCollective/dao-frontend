'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'

import { VIDEO_SRC } from './constants'

export const MotionLogo = ({ className, paused = false }: { className?: string; paused?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined')
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldPlay = isInView && !paused && !prefersReducedMotion

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
