import { useId } from 'react'
import { IconProps } from '../Icons'

interface ImageMaskProps extends IconProps {
  imgUrl: string
  /** desired width of the main image area */
  width: number
  /** desired height of the main image area */
  height: number
  squareSize?: number
}

/**
 * ImageMask component crops an image to specified dimensions and adds pixel-art style holes.
 * Creates a main image area with 3 square holes on the right showing image continuation,
 * and 1 transparent hole on the left. Final width = image width + strip width.
 */
export function ImageMask({
  imgUrl,
  width,
  height,
  squareSize: size = 2.5,
  className,
  ...props
}: ImageMaskProps) {
  const maskId = useId()
  const stripWidth = size * 3
  const totalWidth = width + stripWidth

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      className={className}
      width={totalWidth}
      height={height}
      {...props}
    >
      <defs>
        <mask id={`${maskId}-complete`}>
          {/* Show main image area */}
          <rect width={width} height={height} fill="white" />
          {/* Show holes in strip area */}
          <rect x={width + 0} y={size * 3} width={size} height={size} fill="white" />
          <rect x={width + size} y={size * 4} width={size} height={size} fill="white" />
          <rect x={width + size * 2} y={size * 2} width={size} height={size} fill="white" />
          {/* Transparent hole in main image area */}
          <rect x={width - size} y={size * 3} width={size} height={size} fill="black" />
        </mask>
      </defs>

      {/* Image with mask */}
      <image
        href={imgUrl}
        width={totalWidth}
        height={height}
        preserveAspectRatio="xMidYMid slice"
        mask={`url(#${maskId}-complete)`}
      />
    </svg>
  )
}
