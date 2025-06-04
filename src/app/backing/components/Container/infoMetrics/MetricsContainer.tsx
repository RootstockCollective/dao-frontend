import { FC, PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

export type MetricsContainerProps = PropsWithChildren<{ className?: string }>

export const MetricsContainer: FC<MetricsContainerProps> = ({ className = '', children }) => {
  return (
    <div
      data-testid="MetricsContainer"
      className={cn(
        'flex flex-col justify-center items-start gap-6 shrink-0 self-stretch grow pt-[4.06rem] pb-[4.06rem] pl-6 pr-6 rounded-sm bg-v3-bg-accent-80 divide-y divide-v3-bg-accent-60',
        className,
      )}
    >
      {children}
    </div>
  )
}
