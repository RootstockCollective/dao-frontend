'use client'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { Header, Paragraph } from '../TypographyNew'
import { Button } from '../ButtonNew'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'

interface HeroComponentProps {
  title: string
  subtitle: string
  items: string[]
  buttonText?: string
  buttonOnClick?: () => void
}

const HERO_BANNER_PATH = '/images/hero/hero-banner.svg'
const BANNER_SQUARES_PATH = '/images/hero/banner-squares.svg'

const HeroComponent: React.FC<HeroComponentProps> = ({
  title,
  subtitle,
  items,
  buttonText,
  buttonOnClick,
}) => {
  const imagePaths = useMemo(() => [BANNER_SQUARES_PATH, HERO_BANNER_PATH], [])
  const { isLoaded } = useImagePreloader(imagePaths)

  return (
    <div className="flex flex-col md:flex-row bg-text-80 rounded-sm p-4 md:gap-8 gap-4">
      <div className="relative w-full md:w-1/2 ">
        {isLoaded ? (
          <>
            <Image
              src={BANNER_SQUARES_PATH}
              alt="Squares Divider"
              width={40}
              height={30}
              className="absolute -right-[30px] top-[20px] z-10 hidden md:block"
            />
            <Image
              src={HERO_BANNER_PATH}
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
          <Header className="text-bg-100" caps>
            {title}
          </Header>
          <Header className="text-bg-20" caps>
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

        {buttonText && (
          <div className="flex justify-start mt-2">
            <Button variant="primary" onClick={buttonOnClick}>
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroComponent
