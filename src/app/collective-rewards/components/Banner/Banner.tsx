import Image from 'next/image'
import { ElementType } from 'react'

interface BannerProps {
  imageSrc: string
  altText: string
  DecorativeComponent: ElementType
}

export const Banner = ({ imageSrc, altText, DecorativeComponent }: BannerProps) => {
  return (
    <div className="relative">
      <div className="h-[240px] overflow-hidden relative">
        <Image src={imageSrc} alt={altText} fill />
      </div>
      <DecorativeComponent
        width={50}
        height={40}
        className="absolute bottom-0 right-0 translate-x-[10px] translate-y-[30px] z-base"
      />
    </div>
  )
}
