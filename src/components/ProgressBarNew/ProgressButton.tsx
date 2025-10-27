import { HTMLAttributes } from 'react'
import { AnimatedTilesLoop } from './AnimatedTiles/AnimatedTilesLoop'
import { type Color, progressButtonColors } from './colors'
import { cn } from '@/lib/utils'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  tileSize?: number
  color?: (Color | [Color, Color])[]
}

export function ProgressButton({
  tileSize = 12,
  color = progressButtonColors,
  className,
  children,
  ...props
}: Props) {
  return (
    <AnimatedTilesLoop
      tileSize={tileSize}
      speed={8}
      dispersion={0.7}
      colors={color}
      tileAnimationDuration={0.2}
      className={cn('w-full md:w-[231px] h-12 border border-bg-40', className)}
      {...props}
    >
      <div className="px-4 py-3 flex flex-row">
        <div className="flex items-center justify-center">
          <HourglassAnimatedIcon />
        </div>
        <div className="grow flex items-center justify-center">{children}</div>
      </div>
    </AnimatedTilesLoop>
  )
}
