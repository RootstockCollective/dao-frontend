'use client'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC, ReactNode, useMemo } from 'react'
import { Header, Paragraph, Span } from '../TypographyNew'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'

export interface HeroComponentProps {
  imageSrc: string
  title: string
  subtitle: string
  topText?: string
  items?: string[]
  content?: ReactNode
  button?: ReactNode
  className?: string
}

export const HeroComponent: FC<HeroComponentProps> = ({
  imageSrc,
  title,
  subtitle,
  topText,
  items,
  content,
  button,
  className,
}) => {
  // Memoize image sources is needed to prevent unnecessary re-renders
  const imageSources = useMemo(() => [imageSrc], [imageSrc])
  const { isLoaded } = useImagePreloader(imageSources)

  return (
    <div className={cn('flex flex-col md:flex-row bg-text-80 rounded-sm p-4 gap-4 md:gap-0', className)}>
      <div className="relative w-full md:w-1/2 min-h-[120px] md:min-h-0">
        {isLoaded ? (
          <Image
            src={imageSrc}
            alt="Hero Banner"
            fill
            className="w-full h-full object-cover object-top-right max-h-[120px] md:max-h-none"
          />
        ) : (
          <div className="w-[96%] h-full bg-bg-40 animate-pulse" />
        )}
      </div>
      <div className="flex flex-col justify-center w-full md:w-1/2 pb-6">
        <div className="md:mt-16 flex flex-col">
          {topText ? (
            <Span variant="tag" className="mt-4 text-black">
              {topText}
            </Span>
          ) : null}
          <Header variant="h1" className="text-bg-100 mt-4" caps>
            {title}
          </Header>
          <Header variant="h1" className="text-bg-20 mt-4" caps>
            {subtitle}
          </Header>
        </div>
        {items && items.length > 0 ? (
          <ul className="list-none my-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-bg-100">
                <span className="inline-block mt-2 w-[6px] h-[6px] rounded-[32px] border border-bg-80 bg-transparent flex-shrink-0" />
                <Paragraph className="text-bg-100">{item}</Paragraph>
              </li>
            ))}
          </ul>
        ) : null}
        {content}
        {button && <div className="flex justify-start mt-2">{button}</div>}
      </div>
    </div>
  )
}
