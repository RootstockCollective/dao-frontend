import { useId, useRef } from 'react'
import { cn } from '@/lib/utils/utils'
import { useMemo, HTMLAttributes, useState } from 'react'
import { motion } from 'motion/react'
import { GradientDef } from './GradientDef'
import type { Color } from '../colors'
import { useResizeObserver } from '@/shared/hooks/useResizeObserver'

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Size of each square tile in pixels */
  tileSize: number
  /** Sequence of colors used for the gradient waves */
  colors: (Color | [Color, Color])[]
  /** Speed of wave animation */
  speed: number
  /** Random variation added to each tile's animation delay */
  dispersion: number
  /** Duration of opacity animation for each tile */
  tileAnimationDuration: number
}

/**
 * Renders a looped animated gradient progress bar using tiled SVG mask animation.
 */
export function AnimatedTilesLoop({
  className,
  tileSize,
  speed,
  dispersion,
  tileAnimationDuration,
  colors = [],
  children,
  ...props
}: Props) {
  const uniqueId = useId()
  // Indicates iteration of the loop
  const [wave, setWave] = useState(0)

  /** current and next wave colors */
  const currentColor = colors[wave % colors.length]
  const nextColor = colors[(wave + 1) % colors.length]
  const ref = useRef(null)
  // measure width and height for animations
  const { width, height } = useResizeObserver(ref)
  const { grid, lastIndex } = useMemo(() => {
    const cols = Math.ceil(width / tileSize)
    const rows = Math.ceil(height / tileSize)
    // Generates grid cells with individual animation delays based on their x-position and randomness
    const grid = []
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        grid.push({ x, y, delay: x / speed + Math.random() * dispersion })
      }
    }
    // Finds the cell with the longest delay to trigger the wave transition after its animation ends
    const lastIndex = grid.reduce(
      (bestIdx, cell, idx, arr) => (cell.delay > arr[bestIdx].delay ? idx : bestIdx),
      0,
    )
    return { grid, lastIndex }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, tileSize, height, speed, dispersion, wave])

  return (
    <div ref={ref} className={cn('relative overflow-hidden rounded-md', className)} {...props}>
      <svg shapeRendering="crispEdges" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <motion.mask type="alpha" id={`mask-${uniqueId}`} key={wave}>
            {grid.map(({ x, y, delay }, i) => (
              <motion.rect
                key={`${wave}-${i}`} // remount the grid by setting iteration value to the key
                x={x * tileSize}
                y={y * tileSize}
                width={tileSize}
                height={tileSize}
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay, duration: tileAnimationDuration }}
                onAnimationComplete={() => {
                  // run next wave after the last rect finishes animation
                  if (i === lastIndex) setWave(i => i + 1)
                }}
              />
            ))}
          </motion.mask>
          <GradientDef id={`grad-next-${uniqueId}`} color={nextColor} />
          <GradientDef id={`grad-current-${uniqueId}`} color={currentColor} />
        </defs>
        <rect width={width} height={height} fill={`url(#grad-current-${uniqueId})`} />
        <rect
          mask={`url(#mask-${uniqueId})`}
          width={width}
          height={height}
          fill={`url(#grad-next-${uniqueId})`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  )
}
