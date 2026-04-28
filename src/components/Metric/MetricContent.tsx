import { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

import { CommonComponentProps } from '../../components/commonProps'

type MetricContentProps = CommonComponentProps & PropsWithChildren

export const MetricContent = ({ children, className }: MetricContentProps) => {
  return (
    <div className={cn('flex items-start font-kk-topo', className)} data-testid="MetricContent">
      {children}
    </div>
  )
}
