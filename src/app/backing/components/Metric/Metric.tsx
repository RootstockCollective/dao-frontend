import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'
import { MetricContent } from './MetricContent'

export type MetricProps = CommonComponentProps & {
  title: ReactNode
  content: ReactNode
}

export const Metric: FC<MetricProps> = ({ title, content, className = '' }) => {
  const isTitleTextual = typeof title === 'string'
  const isContentTextual = typeof title === 'string'

  return (
    <div data-testid="Metric" className={cn('flex items-center gap-4', className)}>
      <div className="flex flex-col items-start">
        <div className="flex flex-col items-start gap-2 self-stretch">
          {isTitleTextual ? (
            <Typography variant="body" className="grow not-italic leading-6 text-v3-bg-accent-0">
              {title}
            </Typography>
          ) : (
            title
          )}
          {isContentTextual ? <MetricContent>{content}</MetricContent> : content}
        </div>
      </div>
    </div>
  )
}
