import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../../components/commonProps'

export type MetricContentProps = CommonComponentProps & PropsWithChildren

export const MetricContent: FC<MetricContentProps> = ({ children, className }) => {
  return (
    <div className={cn('flex items-start', className)} data-testid="MetricContent">
      {children}
    </div>
  )
}
