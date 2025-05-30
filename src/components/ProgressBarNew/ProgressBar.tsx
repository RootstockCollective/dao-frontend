import { HTMLAttributes } from 'react'
import { AnimatedTilesProgress } from './AnimatedTiles/AnimatedTilesProgress'
import { type Color, progressBarColors } from './colors'
import { cn } from '@/lib/utils'

interface Props extends Omit<HTMLAttributes<SVGSVGElement>, 'color'> {
  /** 1 - 100 */
  progress: number
  color?: keyof typeof progressBarColors | (Color | [Color, Color])[]
}

export function ProgressBar({ progress, color = 'gradient', className, ...props }: Props) {
  return (
    <AnimatedTilesProgress
      colors={Array.isArray(color) ? color : progressBarColors[color]}
      tileSize={4}
      progress={progress}
      progressSpeed={40}
      className={cn('h-2 w-full', className)}
      /* Randomness params */
      tileAnimationDuration={0.3}
      waveSlope={10}
      dispersion={0.8}
      {...props}
    />
  )
}
