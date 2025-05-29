import { ReactNode } from 'react'
import { AnimatedTilesLoop } from './AnimatedTiles/AnimatedTilesLoop'
import { TimeIcon } from './icons/TimeIcon'
import { type Color, progressBarColors } from './colors'

interface Props {
  width?: number
  height?: number
  color?: keyof typeof progressBarColors | (Color | [Color, Color])[]
  children?: ReactNode
}

export function ProgressButton({ width = 261, height = 48, color = 'gray', children }: Props) {
  return (
    <AnimatedTilesLoop
      tileSize={12}
      width={width}
      height={height}
      speed={8}
      dispersion={0.7}
      colors={Array.isArray(color) ? color : progressBarColors[color]}
      tileAnimationDuration={0.2}
      className="border border-bg-40"
    >
      <div className="w-full px-4 py-3 flex flex-row ">
        <div className="flex items-center justify-center">
          <TimeIcon
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeOut',
              duration: 2,
              repeatDelay: 1,
            }}
          />
        </div>
        <div className="grow flex items-center justify-center">{children}</div>
      </div>
    </AnimatedTilesLoop>
  )
}
