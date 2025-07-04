import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export type ActionMetricsContainerProps = CommonComponentProps

export const ActionMetricsContainer: FC<ActionMetricsContainerProps> = ({ className = '', children }) => {
  return (
    <div
      data-testid={'ActionsMetrics'}
      className={cn('flex flex-col w-full items-start gap-2 rounded-sm p-6', className)}
    >
      <div className="flex items-start gap-14 w-full">{children}</div>
    </div>
  )
}
