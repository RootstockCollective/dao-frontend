import React, { ReactNode } from 'react'
import Image from 'next/image'

interface Props {
  imageSrc: string
  imageSquaresSrc: string
  rightContent: ReactNode
}

export const Banner = ({ imageSrc, imageSquaresSrc, rightContent }: Props) => (
  <div className="flex flex-row gap-[32px] w-full bg-white p-[16px]">
    <div className="w-1/2 h-auto relative">
      <Image
        src={imageSquaresSrc}
        alt="Squares Divider"
        width={40}
        height={30}
        className="absolute -right-[30px] top-[20px] z-10 hidden md:block"
      />
      <Image src={imageSrc} alt="Banner Image" width={0} height={0} className="object-cover w-full h-full" />
    </div>
    <div className="w-1/2">{rightContent}</div>
  </div>
)
