'use client'
import Image from 'next/image'
import React, { FC, ReactNode, useMemo } from 'react'
import { Header, Paragraph } from '../TypographyNew'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'
import { cn } from '@/lib/utils'

interface HeroComponentProps {
  imageBannerSrc: string
  imageSquaresSrc: string
  title: string
  subtitle: string
  items: string[]
  button?: ReactNode
  className?: string
}

export const HeroComponent: FC<HeroComponentProps> = ({
  imageBannerSrc,
  imageSquaresSrc,
  title,
  subtitle,
  items,
  button,
  className,
}) => {
  // Memoize image sources is needed to prevent unnecessary re-renders
  const imageSources = useMemo(() => [imageBannerSrc, imageSquaresSrc], [imageBannerSrc, imageSquaresSrc])
  const { isLoaded } = useImagePreloader(imageSources)

  return (
    <div className={cn('flex flex-col md:flex-row bg-text-80 rounded-sm p-4 md:gap-8 gap-4', className)}>
      <div className="relative w-full md:w-1/2 ">
        {isLoaded ? (
          <>
            <Image
              src={imageSquaresSrc}
              alt="Squares Divider"
              width={40}
              height={30}
              className="absolute -right-[30px] top-[20px] z-10 hidden md:block"
            />
            <Image
              src={imageBannerSrc}
              alt="Hero Banner"
              width={0}
              height={0}
              className="w-full h-full max-h-[180px] md:max-h-none object-cover object-right"
            />
          </>
        ) : (
          <div className="w-full h-full bg-bg-40 animate-pulse" />
        )}
      </div>
      <div className="flex flex-col justify-center w-full md:w-1/2">
        <div className="md:mt-16 flex flex-col gap-2">
          <Header variant="h1" className="text-bg-100" caps>
            {title}
          </Header>
          <Header variant="h1" className="text-bg-20" caps>
            {subtitle}
          </Header>
        </div>
        <ul className="list-none my-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-bg-100">
              <span className="inline-block mt-2 w-[6px] h-[6px] rounded-[32px] border border-bg-80 bg-transparent flex-shrink-0" />
              <Paragraph className="text-bg-100">{item}</Paragraph>
            </li>
          ))}
        </ul>

        {button && <div className="flex justify-start mt-2">{button}</div>}
      </div>
    </div>
  )
}
