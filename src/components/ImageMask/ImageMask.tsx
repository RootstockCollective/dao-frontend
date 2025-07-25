'use client'

import { useEffect, useId, useState } from 'react'
import { IconProps } from '../Icons'

interface ImageMaskProps extends IconProps {
  /** Image to apply squares to */
  src: string
  /** Fallback image to show on error or while image is loading */
  fallbackSrc?: string
  /** Desired width of the main image area */
  width: number
  /** Desired height of the main image area */
  height: number
  /** Pixel-art square size */
  squareSize?: number
}

/**
 * ImageMask component crops an image to specified dimensions and adds pixel-art style holes.
 * Creates a main image area with 3 square holes on the right showing image continuation,
 * and 1 transparent hole on the left. Final width = image width + strip width.
 */
export function ImageMask({
  src,
  fallbackSrc,
  width,
  height,
  squareSize: size = 2.5,
  className,
  ...props
}: ImageMaskProps) {
  const originalImage = useLoadImage(src)
  const fallbackImage = useLoadImage(fallbackSrc)
  const image = originalImage ?? fallbackImage
  const maskId = useId()
  const stripWidth = size * 3
  const totalWidth = width + stripWidth

  // Don't render anything until image is loaded
  if (!image) return null

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

      <image
        href={image.src}
        x={-stripWidth}
        y="0"
        width={totalWidth + stripWidth}
        height={height}
        preserveAspectRatio="xMidYMid slice"
        mask={`url(#${maskId}-complete)`}
        crossOrigin="anonymous"
      />
    </svg>
  )
}

function useLoadImage(imageUrl?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!imageUrl) return

    // Create new Image object to preload the image
    const img = new Image()
    img.onload = () => setImage(img)
    img.onerror = () => setImage(null)
    img.src = imageUrl
    img.crossOrigin = 'anonymous'

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageUrl])

  return image
}
