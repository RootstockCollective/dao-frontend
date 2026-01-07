'use client'
import { ConfigResult, usePixelExtractor, PIXEL_CONFIGS } from '@/app/communities/hooks/usePixelExtractor'
import { useEffect, useState, useRef, type ComponentProps } from 'react'

interface Props extends ComponentProps<'div'> {
  image: string
  config?: keyof typeof PIXEL_CONFIGS
}

/**
 * ImageDebris component is used to display image debris extracted from a given image.
 * @param image - The image source to extract debris from
 * @param config - The pixel extraction configuration to use (defaults to 'topRightDiagonal')
 * @constructor
 */
export const ImageDebris = ({ image, config = 'topRightDiagonal', ...props }: Props) => {
  const [debris, setDebris] = useState<ConfigResult[]>([])
  const { extractPixelsByConfig } = usePixelExtractor()
  const isAlreadyExtracted = useRef(false)
  useEffect(() => {
    if (!isAlreadyExtracted.current) {
      const configArray = PIXEL_CONFIGS[config]
      extractPixelsByConfig(image, configArray).then(data => setDebris(data))
      isAlreadyExtracted.current = true
    }
  }, [image, config, extractPixelsByConfig])

  return (
    <div {...props}>
      {debris.map(debri => (
        // We're using a plain <img> tag instead of next/image because the image debris have unknown dimensions,
        // making it impossible to leverage next/image's optimization features like resizing or lazy loading.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${debri.coordinates.x}${debri.coordinates.y}${debri.className}`}
          src={debri.data}
          className={debri.className}
          alt="Image Debris"
        />
      ))}
    </div>
  )
}
