import { useId, useEffect, useMemo } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { GradientDef } from './GradientDef'
import type { Color } from '../types'

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

interface AnimatedTilesProps {
  /** SVG width in pixels */
  width: number
  /** SVG height in pixels */
  height: number
  /** Size of each tile (square side, in px) */
  tileSize: number
  /** Slope/steepness of the reveal wave (higher = faster reveal across X) */
  waveSlope: number
  /** Amount of random delay added to each tile (for pixelated/glitchy edge) */
  dispersion: number
  /** Duration of fade-in for each tile (in "progress units") */
  tileAnimationDuration: number
  /** Array of two gradient colors (current and next layer) */
  colors: (Color | [Color, Color])[]
  /** Progress value (0–100) */
  progress: number
  /** Animation speed (progress units per second) */
  progressSpeed: number
}

/**
 * Renders an animated tiled SVG mask for a progress bar or background effect,
 * where each tile appears progressively according to a calculated delay and current progress.
 * Supports gradient transitions and a "glitchy" pixel-style animated edge.
 */
export function AnimatedTilesProgress({
  width,
  height,
  tileSize,
  waveSlope,
  dispersion,
  tileAnimationDuration,
  colors,
  progress,
  progressSpeed,
}: AnimatedTilesProps) {
  const uniqueId = useId()
  const maskId = `mask-${uniqueId}`
  const [currentColor, nextColor] = colors

  const cols = Math.ceil(width / tileSize)
  const rows = Math.ceil(height / tileSize)

  const grid = useMemo(() => {
    const arr = []
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const baseDelay = x / waveSlope
        const jitter = random(0, dispersion)
        arr.push({ x: x * tileSize, y: y * tileSize, delay: baseDelay + jitter })
      }
    }
    return arr
  }, [cols, rows, tileSize, waveSlope, dispersion])

  const progressMv = useMotionValue(0)

  useEffect(() => {
    const distance = Math.abs(progress - progressMv.get())
    const duration = distance / progressSpeed
    const controls = animate(progressMv, progress, { duration, ease: 'easeOut' })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, progressSpeed])

  const Rect = ({ x, y, delay }: { x: number; y: number; delay: number }) => {
    const maxDelay = (cols - 1) / waveSlope + dispersion
    const scale = 100 / (maxDelay + tileAnimationDuration)
    const start = delay * scale
    const end = start + tileAnimationDuration
    const opacity = useTransform(progressMv, [start, end], [0, 1])
    return <motion.rect opacity={opacity} x={x} y={y} width={tileSize} height={tileSize} fill="white" />
  }

  return (
    <svg
      className="rounded-sm"
      shapeRendering="crispEdges"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
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
