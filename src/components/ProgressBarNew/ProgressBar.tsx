import { cn } from '@/lib/utils'
import { useMemo, HTMLAttributes, useState, useEffect } from 'react'
import { motion } from 'motion/react'

type Color = `#${string}`
interface Props extends HTMLAttributes<HTMLButtonElement> {
  width: number
  height: number
  tileSize?: number
  colors: Color[]
  speed: number
  dispersion: number
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
  tileSize = 15,
  width = 300,
  height = 60,
  speed = 8,
  dispersion = 0.7,
  colors = ['#25211E', '#66605C'], // bg80 , bg40
  children,
}: Props) {
  const safeTileSize = tileSize || 1 // avoid dividing by zero
  const [wave, setWave] = useState(0)

  /** current and next wave colors */
  const currentColor = colors[wave % colors.length]
  const nextColor = colors[(wave + 1) % colors.length]

  /** cell grid */
  const { grid, lastIndex } = useMemo(() => {
    const cols = Math.floor(width / safeTileSize)
    const rows = Math.floor(height / safeTileSize)
    // 1. Build the array of cells
    const cells: Cell[] = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells.push({ x, y, delay: x / speed + rand(0, dispersion) })
      }
    }
    // 2. Find the index of the cell with the maximum delay
    const idxMax = cells.reduce(
      (bestIdx, cell, idx, arr) => (cell.delay > arr[bestIdx].delay ? idx : bestIdx),
      0,
    )
    return { grid: cells, lastIndex: idxMax }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTileSize, width, height, speed, colors, wave, dispersion])

  return (
    <div
      className={cn('relative overflow-hidden rounded-md border border-neutral-400', className)}
      style={{ width, height, backgroundColor: currentColor }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {grid.map(({ x, y, delay }, i) => (
          <motion.rect
            key={`${wave}-${i}`} // remount the grid by setting iteration to the key
            x={x * safeTileSize}
            y={y * safeTileSize}
            width={safeTileSize * 1.1} // to avoid overlapping multiply by 1.1
            height={safeTileSize * 1.1}
            fill={nextColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration: 0.1 }}
            onAnimationComplete={() => {
              // run next wave after the last rect finishes animation
              if (i === lastIndex) setWave(i => i + 1)
            }}
          />
        ))}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  )
}
