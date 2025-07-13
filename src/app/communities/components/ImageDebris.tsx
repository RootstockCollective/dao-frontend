'use client'
import { ConfigResult, usePixelExtractor } from '@/app/communities/hooks/usePixelExtractor'
import { useEffect, useState } from 'react'

interface Props {
  image: string
}

export const ImageDebris = ({ image }: Props) => {
  const [debris, setDebris] = useState<ConfigResult[]>([])
  const { extractPixelsByConfig } = usePixelExtractor()
  useEffect(() => {
    extractPixelsByConfig(image).then(data => setDebris(data))
  }, [])

  return (
    <>
      {debris.map(debri => (
        <img key={debri.data} src={debri.data} className={debri.className} />
      ))}
    </>
  )
}
