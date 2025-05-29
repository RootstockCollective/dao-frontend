import { AnimatedTilesLoop } from './AnimatedTiles/AnimatedTilesLoop'
import { type Color, progressBarColors } from './colors'
interface Props {
  width?: number
  color?: keyof typeof progressBarColors | (Color | [Color, Color])[]
}
export function ProgressBarLoop({ width = 644, color = 'gradient' }: Props) {
  return (
    <AnimatedTilesLoop
      colors={Array.isArray(color) ? color : progressBarColors[color]}
      tileSize={4}
      height={8}
      width={width}
      speed={20}
      dispersion={0.3}
      tileAnimationDuration={0.1}
    />
  )
}
