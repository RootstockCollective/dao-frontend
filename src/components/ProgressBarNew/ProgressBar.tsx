import { useId } from 'react'
import { cn } from '@/lib/utils'
import { useMemo, HTMLAttributes, useState, useEffect } from 'react'
import { motion } from 'motion/react'

type Color = `#${string}`
interface Props extends HTMLAttributes<HTMLButtonElement> {
  width: number
  height: number
  tileSize?: number
  colors: (Color | [Color, Color])[]
  speed: number
  dispersion: number
  tileAnimationDuration: number
}

interface Cell {
  x: number
  y: number
  delay: number
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function ProgressBar({
  className,
  tileSize: rawTileSize = 15,
  width: rawWidth = 300,
  height: rawHeight = 60,
  speed: rawSpeed = 8,
  dispersion: rawDispersion = 0.7,
  tileAnimationDuration = 0.2,
  colors = ['#25211E', '#66605C'], // bg80 , bg40
  children,
}: Props) {
  const tileSize = Math.max(rawTileSize, 1)
  const width = Math.max(Math.abs(rawWidth), 2)
  const height = Math.max(Math.abs(rawHeight), 2)
  const dispersion = Math.abs(rawDispersion)
  const speed = Math.max(Math.abs(rawSpeed), 1)

  const uniqueId = useId()
  const [wave, setWave] = useState(0)

  /** current and next wave colors */
  const currentColor = colors[wave % colors.length]
  const nextColor = colors[(wave + 1) % colors.length]

  /** cell grid */
  const { grid, lastIndex } = useMemo(() => {
    const cols = Math.max(1, Math.ceil(width / tileSize))
    const rows = Math.max(1, Math.ceil(height / tileSize))
    // 1. Build the array of cells
    const grid: Cell[] = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        grid.push({ x, y, delay: x / speed + rand(0, dispersion) })
      }
    }
    // 2. Find the index of the cell with the maximum delay
    const lastIndex = grid.reduce(
      (bestIdx, cell, idx, arr) => (cell.delay > arr[bestIdx].delay ? idx : bestIdx),
      0,
    )
    return { grid, lastIndex }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, tileSize, height, speed, dispersion, wave])

  return (
    <div className={cn('relative overflow-hidden rounded-md', className)} style={{ width, height }}>
      <svg shapeRendering="crispEdges" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <mask type="alpha" id={`mask-${uniqueId}`} key={wave}>
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
          </mask>
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

function GradientDef({ id, color }: { id: string; color: Color | [Color, Color] }) {
  return (
    <linearGradient id={id}>
      {Array.isArray(color) ? (
        <>
          <stop offset="0%" stopColor={color[0]} />
          <stop offset="100%" stopColor={color[1]} />
        </>
      ) : (
        <>
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </>
      )}
    </linearGradient>
  )
}
