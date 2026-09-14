'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'

const VIDEO_SRC = '/videos/collective-motion-logo.mp4'
const POSTER_SRC = '/images/collective-motion-logo-poster.webp'

/**
 * Animated Collective logo. Falls back to the poster frame when the viewer asked
 * their system for reduced motion.
 */
export const MotionLogo = ({ className }: { className?: string }) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative overflow-hidden', className)} data-testid="MotionLogo">
      {prefersReducedMotion ? (
        <Image src={POSTER_SRC} alt="" aria-hidden="true" fill sizes="200px" className="object-cover" />
      ) : (
        <video
          className="size-full object-cover"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
