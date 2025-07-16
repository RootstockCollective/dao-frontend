import { useId, useEffect, useMemo, useRef, HTMLAttributes } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { GradientDef } from './GradientDef'
import type { Color } from '../colors'
import { useResizeObserver } from '@/shared/hooks/useResizeObserver'
import { cn } from '@/lib/utils'

interface AnimatedTilesProps extends HTMLAttributes<SVGSVGElement> {
  /** Size of each tile (square side, in px) */
  tileSize: number
  /** Array of two gradient colors (current and next layer) */
  colors: (Color | [Color, Color])[]
  /** Progress value (0–100) */
  progress: number
  /** Animation speed (progress units per second) */
  progressSpeed: number

  /** Randomness */

  /** Duration of fade-in for each tile (in "progress units") */
  tileAnimationDuration: number
  /** Slope/steepness of the reveal wave (higher = faster reveal across X) */
  waveSlope: number
  /** Amount of random delay added to each tile (for pixelated/glitchy edge) */
  dispersion: number
}

/**
 * Renders an animated tiled SVG mask for a progress bar or background effect,
 * where each tile appears progressively according to a calculated delay and current progress.
 * Supports gradient transitions and a "glitchy" pixel-style animated edge.
 */
export function AnimatedTilesProgress({
  tileSize,
  waveSlope,
  dispersion,
  tileAnimationDuration,
  colors,
  progress,
  progressSpeed,
  className,
  ...props
}: AnimatedTilesProps) {
  const progressMv = useMotionValue(0)
  const uniqueId = useId()
  const ref = useRef<SVGSVGElement>(null)
  const lastProgressRef = useRef<number | null>(null) // null means not initialized

  // getting size from CSS
  const { width, height } = useResizeObserver(ref)
  const maskId = `mask-${uniqueId}`
  const [currentColor, nextColor] = colors
  const cols = Math.ceil(width / tileSize)
  const rows = Math.ceil(height / tileSize)
  const maxDelay = (cols - 1) / waveSlope + dispersion
  const scale = 100 / (maxDelay + tileAnimationDuration)

  // calculate width * height grid with all the tiles parameters
  const grid = useMemo(() => {
    const arr = []
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const baseDelay = x / waveSlope
        const jitter = Math.random() * dispersion
        const delay = baseDelay + jitter
        const start = delay * scale
        const end = start + tileAnimationDuration
        arr.push({ x: x * tileSize, y: y * tileSize, start, end })
      }
    }
    return arr
  }, [cols, rows, tileSize, waveSlope, dispersion, scale, tileAnimationDuration])

  // start animation when progress value is changed
  useEffect(() => {
    const currentProgressValue = progressMv.get()
    const threshold = 0.1 // Small threshold to avoid unnecessary animations due to floating point precision

    // Only animate if:
    // 1. This is the first initialization, OR
    // 2. The progress value has actually changed significantly
    const shouldAnimate =
      lastProgressRef.current === null || Math.abs(progress - lastProgressRef.current!) > threshold

    if (shouldAnimate) {
      const distance = Math.abs(progress - currentProgressValue)
      const duration = distance / progressSpeed
      const controls = animate(progressMv, progress, { duration, ease: 'easeOut' })

      lastProgressRef.current = progress

      return () => controls.stop()
    } else {
      // If we shouldn't animate but need to update the value (e.g., after resize), set it directly
      if (Math.abs(progress - currentProgressValue) > threshold) {
        progressMv.set(progress)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, progressSpeed])

  // draw single rectangle of the grid
  const Rect = ({ x, y, start, end }: { x: number; y: number; start: number; end: number }) => {
    const opacity = useTransform(progressMv, [start, end], [0, 1])
    return <motion.rect opacity={opacity} x={x} y={y} width={tileSize} height={tileSize} fill="white" />
  }

  return (
    <svg
      ref={ref}
      className={cn('rounded-sm', className)}
      shapeRendering="crispEdges"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      {...props}
    >
      <defs>
        <mask id={maskId} type="alpha">
          {grid.map((params, i) => (
            <Rect {...params} key={i} />
          ))}
        </mask>
        <GradientDef id={`grad-next-${uniqueId}`} color={nextColor} />
        <GradientDef id={`grad-current-${uniqueId}`} color={currentColor} />
      </defs>
      <rect width={width} height={height} fill={`url(#grad-current-${uniqueId})`} />
      <rect mask={`url(#${maskId})`} width={width} height={height} fill={`url(#grad-next-${uniqueId})`} />
    </svg>
  )
}
