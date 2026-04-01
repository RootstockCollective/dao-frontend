import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

type ActionMetricsContainerProps = CommonComponentProps

export const ActionMetricsContainer: FC<ActionMetricsContainerProps> = ({ className = '', children }) => {
  return (
    <div
      data-testid={'ActionsMetrics'}
      className={cn(
        'flex flex-col w-full items-start gap-2 rounded-sm px-4 py-8 md:px-6 md:py-10',
        className,
      )}
    >
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-14 w-full">{children}</div>
    </div>
  )
}
