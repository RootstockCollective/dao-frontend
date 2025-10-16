import { HTMLAttributes } from 'react'
import { AnimatedTilesProgress } from './AnimatedTiles/AnimatedTilesProgress'
import { type Color, progressBarColors } from './colors'
import { cn } from '@/lib/utils'

type GradientColors = Color | [Color] | [Color, Color] | [Color, Color, Color]

interface Props extends Omit<HTMLAttributes<SVGSVGElement>, 'color'> {
  /** 1 - 100 */
  progress: number
  color?: keyof typeof progressBarColors | [GradientColors, GradientColors] | GradientColors
}

export function ProgressBar({ progress, color = 'gradient', className, ...props }: Props) {
  const getColors = (): [GradientColors, GradientColors] => {
    if (Array.isArray(color)) {
      // Check if it's a tuple of two gradients [currentGradient, nextGradient]
      // This is only true if the first element is an array (nested structure)
      if (color.length === 2 && Array.isArray(color[0])) {
        return color as [GradientColors, GradientColors]
      }
      // Single gradient (1-3 colors) - use gray for unprogressed area, gradient for progressed area
      return ['#66605C', color as GradientColors]
    }
    // Single color string - use gray for unprogressed area, color for progressed area
    return ['#66605C', color as GradientColors]
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
