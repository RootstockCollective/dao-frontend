import { cn } from '@/lib/utils'
import { useMemo, HTMLAttributes } from 'react'
import { motion } from 'motion/react'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  width: number
  height: number
  tileSize?: number
}

interface Cell {
  x: number
  y: number
  delay: number
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function FancyProgressButton({ className, tileSize = 15, width = 300, height = 60, children }: Props) {
  // grid of squares covering all the button
  const grid = useMemo<Cell[]>(() => {
    const cols = Math.floor(width / tileSize)
    const rows = Math.floor(height / tileSize)
    const cells: Cell[] = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const delay = x / 8 + getRandomArbitrary(0, 0.5)
        cells.push({ x, y, delay })
      }
    }
    return cells
  }, [tileSize, width, height])

  return (
    <button
      className={cn('overflow-hidden rounded-md bg-neutral-800 border border-neutral-400', className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {grid.map(({ x, y, delay }, i) => (
          <motion.rect
            key={i}
            x={x * tileSize}
            y={y * tileSize}
            width={tileSize}
            height={tileSize}
            fill="#a1a1a1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration: 0.1 }}
            className=""
          />
        ))}
      </svg>
      <span>{children}</span>
    </button>
  )
}
