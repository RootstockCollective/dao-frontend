import { HTMLAttributes } from 'react'
import { AnimatedTilesLoop } from './AnimatedTiles/AnimatedTilesLoop'
import { type Color, progressBarColors } from './colors'
import { cn } from '@/lib/utils'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  color?: keyof typeof progressBarColors | (Color | [Color, Color])[]
}

export function ProgressBarLoop({ color = 'gradient', className, ...props }: Props) {
  return (
    <AnimatedTilesLoop
      colors={Array.isArray(color) ? color : progressBarColors[color]}
      tileSize={4}
      speed={20}
      dispersion={0.3}
      tileAnimationDuration={0.1}
      className={cn('h-2 w-full', className)}
      {...props}
    />
  )
}
