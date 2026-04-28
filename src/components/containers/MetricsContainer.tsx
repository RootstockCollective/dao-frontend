import { cn } from '@/lib/utils'

import { CommonComponentProps } from '../commonProps'

type MetricsContainerProps = CommonComponentProps

export const MetricsContainer = ({ className = '', children }: MetricsContainerProps) => {
  return (
    <div
      data-testid={'MetricsContainer'}
      className={cn(
        'flex flex-col justify-center items-center gap-3 md:gap-6 shrink-0 self-stretch grow px-4 py-6 md:p-6 rounded-sm bg-v3-bg-accent-80 divide-y divide-v3-text-20 overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
