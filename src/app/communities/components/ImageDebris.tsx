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
  }, [])

  return (
    <>
      {debris.map(debri => (
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
