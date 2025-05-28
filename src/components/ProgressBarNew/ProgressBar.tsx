import React from 'react'
import { AnimatedTilesProgress } from './AnimatedTiles/AnimatedTilesProgress'

interface Props {
  /** 1 - 100 */
  progress: number
}
export function ProgressBar({ progress }: Props) {
  return (
    <AnimatedTilesProgress
      colors={['#25211E', ['#4B5CF0', '#C27265']]}
      tileSize={4}
      height={8}
      width={644}
      waveSlope={35}
      dispersion={0.3}
      tileAnimationDuration={0.1}
      progress={progress}
      progressSpeed={40}
    />
  )
}
