'use client'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC, ReactNode, useMemo, useState } from 'react'
import { Header, Paragraph, Span } from '../Typography'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { KotoChevronDownIcon } from '../Icons'

export interface HeroComponentProps {
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

export const HeroComponent: FC<HeroComponentProps> = ({
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
  const isDesktop = useIsDesktop()
  // Memoize image sources is needed to prevent unnecessary re-renders
  const imageSources = useMemo(() => [imageSrc], [imageSrc])
  const { isLoaded } = useImagePreloader(isDesktop ? imageSources : [])

  const [showItems, setShowItems] = useState(false)

  return (
    <div
      className={cn('flex flex-col md:flex-row bg-text-80 rounded-sm p-4 gap-4 md:gap-0', className)}
      data-testid={dataTestId}
    >
      {isDesktop && (
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
      )}

      <div className="flex flex-col justify-center w-full md:w-1/2 md:mb-6">
        <div className="flex flex-row items-start gap-4">
          <div className="md:mt-16 flex flex-col">
            {topText ? (
              <Span variant="tag" className="mt-4 text-black">
                {topText}
              </Span>
            ) : null}
            <Header variant="h1" className="text-bg-100" caps>
              {title}{' '}
              <Span variant="h1" className="text-bg-20" caps>
                {subtitle}
              </Span>
            </Header>
          </div>
          {items.length > 0 && (
            <button className="md:hidden flex" onClick={() => setShowItems(!showItems)}>
              <span className={`transition-transform ${showItems ? 'rotate-180' : ''}`}>
                <KotoChevronDownIcon />
              </span>
            </button>
          )}
        </div>
        {items.length > 0 && (
          <>
            <ul
              className={cn(
                'list-none mt-4 transition-all duration-300 ease-in-out overflow-hidden',
                showItems ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[500px] md:opacity-100',
              )}
            >
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-bg-100">
                  <span className="inline-block mt-2 w-[6px] h-[6px] rounded-[32px] border border-bg-80 bg-transparent flex-shrink-0" />
                  <Paragraph className="text-bg-100">{item}</Paragraph>
                </li>
              ))}
            </ul>
          </>
        )}
        {content}
        {button && <div className="flex justify-start mt-6">{button}</div>}
      </div>
    </div>
  )
}
