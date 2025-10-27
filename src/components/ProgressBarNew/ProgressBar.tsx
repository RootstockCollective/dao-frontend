import { HTMLAttributes } from 'react'
import { AnimatedTilesProgress } from './AnimatedTiles/AnimatedTilesProgress'
import { type GradientColors, progressBarColors } from './colors'
import { cn } from '@/lib/utils'

interface Props extends Omit<HTMLAttributes<SVGSVGElement>, 'color'> {
  /** 1 - 100 */
  progress: number
  color?: GradientColors
}

export function ProgressBar({
  progress,
  color = progressBarColors as GradientColors,
  className,
  ...props
}: Props) {
  const getColors = (): [GradientColors, GradientColors] => {
    if (Array.isArray(color)) {
      // Array of colors (1, 2, or 3) - use gray for unprogressed area, gradient for progressed area
      return ['#66605C', color]
    }
    // Single color - use gray for unprogressed area, color for progressed area
    return ['#66605C', color]
  }

  return (
    <AnimatedTilesProgress
      colors={getColors()}
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
