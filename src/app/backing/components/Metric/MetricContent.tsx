import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../commonProps'

export type MetricContentProps = CommonComponentProps & PropsWithChildren

export const MetricContent: FC<MetricContentProps> = ({ children, className, dataTestId }) => {
  return (
    <div className={cn('flex items-start', className)} data-testid={`${dataTestId}_MetricContent`}>
      {children}
    </div>
  )
}
