'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { Header, Paragraph, Span } from '../Typography'
import { Expandable, ExpandableHeader, ExpandableContent, ExpandableFooter } from '@/components/Expandable'
import { BulletPoint } from './BulletPoint'

export interface HeroComponentMobileProps {
  title: string
  subtitle: string
  topText?: string
  items?: ReactNode[]
  content?: ReactNode
  button?: ReactNode
  className?: string
  dataTestId?: string
}

/**
 * Hero component for mobile screens.
 * Displays a hero image with a title and subtitle.
 * This component uses the Expandable component to display the content.
 */
export const HeroComponentMobile: FC<HeroComponentMobileProps> = ({
  title,
  subtitle,
  topText,
  items = [],
  content,
  button,
  className,
  dataTestId,
}) => {
  const hasExpandableContent = content || items.length > 0
  return (
    <Expandable className={cn('bg-text-80 rounded-sm p-4', className)} dataTestId={dataTestId}>
      <ExpandableHeader>
        <div className="flex flex-col">
          {topText && (
            <Span variant="tag" className="mt-4 text-black">
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
      </ExpandableHeader>

      {hasExpandableContent && (
        <ExpandableContent>
          {items.length > 0 && (
            <ul className="flex flex-col gap-1 list-none mb-4">
              {items.map((item: ReactNode, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-bg-100">
                  <BulletPoint />
                  {typeof item === 'string' ? <Paragraph className="text-bg-100">{item}</Paragraph> : item}
                </li>
              ))}
            </ul>
          )}
          {content}
        </ExpandableContent>
      )}

      {button && <ExpandableFooter>{button}</ExpandableFooter>}
    </Expandable>
  )
}
