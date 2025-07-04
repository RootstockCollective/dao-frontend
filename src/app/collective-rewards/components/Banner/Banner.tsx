import Image from 'next/image'
import { ElementType } from 'react'

interface BannerProps {
  imageSrc: string
  altText: string
  DecorativeComponent: ElementType
}

export const Banner = ({ imageSrc, altText, DecorativeComponent }: BannerProps) => {
  return (
    <div className="relative p-4">
      <div className="min-w-[536px] h-[240px] overflow-hidden relative">
        <Image src={imageSrc} alt={altText} fill />
      </div>
      <DecorativeComponent
        width={50}
        height={40}
        className="absolute bottom-0 right-0 translate-x-[-6px] translate-y-[14px] z-20"
      />
    </div>
  )
}
