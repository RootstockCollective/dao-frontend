'use client'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC, ReactNode, useMemo } from 'react'
import { Header, Paragraph, Span } from '../Typography'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'

export interface HeroComponentDesktopProps {
  imageSrc: string
  title: string
  subtitle: string
  topText?: string
  items?: string[]
  content?: ReactNode
  button?: ReactNode
  className?: string
  dataTestId?: string
}

export const HeroComponentDesktop: FC<HeroComponentDesktopProps> = ({
  imageSrc,
  title,
  subtitle,
  topText,
  items = [],
  content,
  button,
  className,
  dataTestId,
}) => {
  // Memoize image sources is needed to prevent unnecessary re-renders
  const imageSources = useMemo(() => [imageSrc], [imageSrc])
  const { isLoaded } = useImagePreloader(imageSources)

  return (
    <div className={cn('flex flex-row bg-text-80 rounded-sm p-4 gap-0', className)} data-testid={dataTestId}>
      <div className="relative w-1/2 min-h-0">
        {isLoaded ? (
          <Image
            src={imageSrc}
            alt="Hero Banner"
            fill
            className="w-full h-full object-cover object-top-right"
          />
        ) : (
          <div className="w-[96%] h-full bg-bg-40 animate-pulse" />
        )}
      </div>

      <div className="flex flex-col justify-center w-1/2 mb-6">
        <div className="flex flex-row items-start gap-4">
          <div className="mt-16 flex flex-col">
            {topText && (
              <Span variant="tag" className="mt-4 text-black" caps>
                {topText}
              </Span>
            )}
            <Header variant="h1" className="text-bg-100" caps>
              {title}{' '}
              <Span variant="h1" className="text-bg-20" caps>
                {subtitle}
              </Span>
            </Header>
          </div>
        </div>

        <div className="mt-4">
          <ul className="list-none">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-bg-100">
                <span className="inline-block mt-2 w-[6px] h-[6px] rounded-[32px] border border-bg-80 bg-transparent flex-shrink-0" />
                <Paragraph className="text-bg-100">{item}</Paragraph>
              </li>
            ))}
          </ul>
        </div>

        {content}
        {button && <div className="flex justify-start mt-6">{button}</div>}
      </div>
    </div>
  )
}
