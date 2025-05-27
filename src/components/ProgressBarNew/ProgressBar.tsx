import { AnimatedTiles } from './AnimatedTiles'
interface Props {
  width?: number
}
export function ProgressBar({ width = 644 }: Props) {
  return (
    <AnimatedTiles
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
