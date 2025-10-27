import { HTMLAttributes } from 'react'
import { AnimatedTilesProgress } from './AnimatedTiles/AnimatedTilesProgress'
import { type GradientColors, progressBarColors, type Color } from './colors'
import { cn } from '@/lib/utils'

interface Props extends Omit<HTMLAttributes<SVGSVGElement>, 'color'> {
  /** 1 - 100 */
  progress: number
  color?: GradientColors | (Color | [Color, Color])[]
}

export function ProgressBar({ progress, color = progressBarColors, className, ...props }: Props) {
  const getColors = (): [GradientColors, GradientColors] => {
    // If it's an array of color pairs (for cycling), use the first one as current and second as next
    if (Array.isArray(color) && color.length > 0 && Array.isArray(color[0])) {
      const colorPairs = color as [Color, Color][]
      return [colorPairs[0], colorPairs[1] || colorPairs[0]]
    }
    // If it's an array of single colors, create a gradient from all colors
    if (Array.isArray(color) && color.length > 0 && typeof color[0] === 'string') {
      return ['#66605C', color as GradientColors]
    }
    // Single color or gradient - use gray for unprogressed area, color for progressed area
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
