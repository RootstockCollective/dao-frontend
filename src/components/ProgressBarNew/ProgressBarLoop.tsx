import { AnimatedTilesLoop } from './AnimatedTiles/AnimatedTilesLoop'
interface Props {
  width?: number
}
export function ProgressBarLoop({ width = 644 }: Props) {
  return (
    <AnimatedTilesLoop
      colors={['#25211E', ['#4B5CF0', '#C27265']]}
      tileSize={4}
      height={8}
      width={width}
      speed={20}
      dispersion={0.3}
      tileAnimationDuration={0.1}
    />
  )
}
