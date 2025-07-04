import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../../components/commonProps'
import { MetricContent } from './MetricContent'

export type MetricProps = CommonComponentProps & {
  title: ReactNode
}

export const Metric: FC<MetricProps> = ({ title, children, className = '' }) => {
  const isTitleTextual = typeof title === 'string'

  return (
    <div data-testid="Metric" className={cn('flex items-center gap-4 w-full', className)}>
      <div className="w-full flex flex-col gap-2">
        {isTitleTextual ? (
          <Typography variant="body" className="grow not-italic leading-6 text-v3-bg-accent-0">
            {title}
          </Typography>
        ) : (
          title
        )}
        <MetricContent>{children}</MetricContent>
      </div>
    </div>
  )
}
