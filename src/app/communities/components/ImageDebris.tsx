'use client'
import { ConfigResult, usePixelExtractor } from '@/app/communities/hooks/usePixelExtractor'
import { useEffect, useState } from 'react'

interface Props {
  image: string
}

/**
 * ImageDebris component is used to display image debris extracted from a given image.
 * @param image
 * @constructor
 */
export const ImageDebris = ({ image }: Props) => {
  const [debris, setDebris] = useState<ConfigResult[]>([])
  const { extractPixelsByConfig } = usePixelExtractor()
  useEffect(() => {
    extractPixelsByConfig(image).then(data => setDebris(data))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
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
    </>
  )
}
