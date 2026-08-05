'use client'

import { motion, type TargetAndTransition, useReducedMotion } from 'motion/react'
import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Only transform and opacity, so every step change stays on the compositor. */
type BlobPose = TargetAndTransition & {
  /** Translation as a share of the blob's own size. */
  x: string
  y: string
  scale: number
  opacity: number
}

interface Blob {
  /** Colour and size of the blob. Colours come from theme tokens, never raw hex. */
  className: string
  /** One pose per step. Steps beyond the list wrap around. */
  poses: BlobPose[]
}

/**
 * Three soft radial blobs over a base gradient.
 *
 * Deliberately no `filter: blur()` — a radial gradient with a transparent outer stop is
 * already soft, and blurring a surface this large is the one thing that turns this effect
 * into a repaint cost on mobile. Only `transform` and `opacity` are animated.
 */
const BLOBS: Blob[] = [
  {
    // Warm highlight, travels down the panel as the user advances.
    className:
      'h-[80%] w-[110%] -top-[15%] -left-[20%] bg-[radial-gradient(closest-side,var(--color-text-80),transparent)]',
    poses: [
      { x: '0%', y: '0%', scale: 1, opacity: 0.95 },
      { x: '10%', y: '35%', scale: 1.15, opacity: 0.7 },
      { x: '-5%', y: '70%', scale: 1.3, opacity: 0.5 },
    ],
  },
  {
    // Orange core.
    className:
      'h-[70%] w-[100%] top-[10%] -left-[10%] bg-[radial-gradient(closest-side,var(--color-primary),transparent)]',
    poses: [
      { x: '0%', y: '0%', scale: 1, opacity: 0.9 },
      { x: '15%', y: '-20%', scale: 1.25, opacity: 1 },
      { x: '-10%', y: '-45%', scale: 1.1, opacity: 0.85 },
    ],
  },
  {
    // Brand blue rising from the bottom.
    className:
      'h-[75%] w-[120%] bottom-[-20%] -left-[10%] bg-[radial-gradient(closest-side,var(--color-brand-rif-blue),transparent)]',
    poses: [
      { x: '0%', y: '10%', scale: 1, opacity: 0.85 },
      { x: '-10%', y: '-10%', scale: 1.2, opacity: 0.95 },
      { x: '5%', y: '-30%', scale: 1.35, opacity: 1 },
    ],
  },
]

const TRANSITION = { duration: 1.2, ease: [0.22, 1, 0.36, 1] } as const

interface AnimatedGradientSurfaceProps {
  /** Zero-based step index. Changing it moves the gradient toward that step's pose. */
  step?: number
  className?: string
  children?: ReactNode
  'data-testid'?: string
}

/**
 * A living gradient panel that travels as the user moves through a flow.
 *
 * The blobs are one persistent set of elements that animate *toward* each step's pose —
 * they are never remounted per step, because a remount reads as a glitch rather than as
 * continuity, and continuity is the whole point.
 *
 * Honours `prefers-reduced-motion`: the gradient still differs per step, it just snaps
 * instead of travelling.
 */
export const AnimatedGradientSurface = ({
  step = 0,
  className,
  children,
  'data-testid': dataTestId = 'animated-gradient-surface',
}: AnimatedGradientSurfaceProps) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-gradient-to-b from-primary to-brand-rif-blue',
        className,
      )}
      data-step={step}
      data-testid={dataTestId}
    >
      {BLOBS.map((blob, index) => (
        <motion.div
          key={index}
          className={cn('pointer-events-none absolute', blob.className)}
          animate={blob.poses[step % blob.poses.length]}
          transition={prefersReducedMotion ? { duration: 0 } : TRANSITION}
          aria-hidden
        />
      ))}

      {children && <div className="relative z-base h-full">{children}</div>}
    </div>
  )
}
