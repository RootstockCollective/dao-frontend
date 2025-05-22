import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../commonProps'

export type ActionMetricsContainerProps = CommonComponentProps & PropsWithChildren

export const ActionMetricsContainer: FC<ActionMetricsContainerProps> = ({
  dataTestid,
  className,
  children,
}) => {
  return (
    <div
      data-testid={`${dataTestid}_ActionsMetrics`}
      className={cn(
        'flex flex-col w-[71.5rem] items-start gap-2 rounded-sm p-6 bg-v3-bg-accent-80',
        className,
      )}
    >
      <div className="flex items-start gap-14">{children}</div>
    </div>
  )
}
