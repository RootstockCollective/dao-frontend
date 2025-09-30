'use client'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC, ReactNode, useMemo } from 'react'
import { Header, Paragraph, Span } from '../Typography'
import { useImagePreloader } from '@/shared/hooks/useImagePreloader'
import { BulletPoint } from './BulletPoint'
import { HeroComponentProps } from './types'

/**
 * Hero component for desktop screens.
 * Displays a hero image with a title and subtitle.
 */
export const HeroComponentDesktop: FC<HeroComponentProps> = ({
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

        {items.length > 0 && (
          <div className="mt-4">
            <ul className="list-none">
              {items.map((item: ReactNode, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-base text-bg-100">
                  <BulletPoint />
                  {typeof item === 'string' ? <Paragraph className="text-bg-100">{item}</Paragraph> : item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {content}
        {button && <div className="flex justify-start mt-6">{button}</div>}
      </div>
    </div>
  )
}
