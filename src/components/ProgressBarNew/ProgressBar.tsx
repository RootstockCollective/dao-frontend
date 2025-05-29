import React from 'react'
import { AnimatedTilesProgress } from './AnimatedTiles/AnimatedTilesProgress'
import { type Color, progressBarColors } from './colors'

interface Props {
  /** 1 - 100 */
  progress: number
  color?: keyof typeof progressBarColors | (Color | [Color, Color])[]
}

export function ProgressBar({ progress, color = 'gradient' }: Props) {
  return (
    <AnimatedTilesProgress
      colors={Array.isArray(color) ? color : progressBarColors[color]}
      tileSize={4}
      height={8}
      width={644}
      progress={progress}
      progressSpeed={40}
      /* Randomness params */
      tileAnimationDuration={0.3}
      waveSlope={10}
      dispersion={0.8}
    />
  )
}
