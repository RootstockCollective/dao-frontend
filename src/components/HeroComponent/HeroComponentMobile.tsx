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
  items?: (ReactNode | string)[]
  content?: ReactNode
  button?: ReactNode
  className?: string
  dataTestId?: string
}

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

      {(items.length > 0 || content) && (
        <ExpandableContent>
          <ul className="list-none mb-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-bg-100">
                <span className="inline-block mt-2 w-[6px] h-[6px] rounded-[32px] border border-bg-80 bg-transparent flex-shrink-0" />
                <BulletPoint />
                {typeof item === 'string' ? <Paragraph className="text-bg-100">{item}</Paragraph> : item}
              </li>
            ))}
          </ul>
          {content}
        </ExpandableContent>
      )}

      {button && <ExpandableFooter>{button}</ExpandableFooter>}
    </Expandable>
  )
}
