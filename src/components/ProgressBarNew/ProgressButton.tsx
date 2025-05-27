import { ReactNode } from 'react'
import { AnimatedTiles } from './AnimatedTiles'
import { TimeIcon } from './icons/TimeIcon'

interface Props {
  width?: number
  height?: number
  children?: ReactNode
}
export function ProgressButton({ width = 261, height = 48, children }: Props) {
  return (
    <AnimatedTiles
      tileSize={12}
      width={width}
      height={height}
      speed={8}
      dispersion={0.7}
      colors={['#25211E', '#66605C']} // bg80 , bg40
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
    </AnimatedTiles>
  )
}
