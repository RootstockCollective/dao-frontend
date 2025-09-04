import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../../components/commonProps'
import { MetricContent } from './MetricContent'

type MetricProps = CommonComponentProps & {
  title: ReactNode
  containerClassName?: string
  contentClassName?: string // TODO: @refactor antipattern MetricContent should be passed as children
  'data-testid'?: string
}

export const Metric: FC<MetricProps> = ({
  title,
  children,
  className = '',
  containerClassName = '',
  contentClassName = '',
  'data-testid': dataTestId = 'Metric',
}) => {
  const isTitleTextual = typeof title === 'string'

  return (
    <div data-testid={dataTestId} className={cn('flex items-center gap-4 w-full', className)}>
      <div className={cn('w-full flex flex-col gap-2', containerClassName)}>
        {isTitleTextual ? (
          <Paragraph variant="body-s" className="text-v3-bg-accent-0 md:text-base">
            {title}
          </Paragraph>
        ) : (
          title
        )}
        <MetricContent className={contentClassName}>{children}</MetricContent>
      </div>
    </div>
  )
}
