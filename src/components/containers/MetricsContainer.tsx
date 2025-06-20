import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export type MetricsContainerProps = CommonComponentProps

export const MetricsContainer: FC<MetricsContainerProps> = ({ className = '', children }) => {
  return (
    <div
      data-testid={'MetricsContainer'}
      className={cn(
        'flex flex-col justify-center items-center gap-2 shrink-0 self-stretch grow pt-[4.06rem] pb-[4.06rem] pl-6 pr-6 rounded-sm bg-v3-bg-accent-80 divide-y divide-v3-text-20',

        className,
      )}
    >
      {children}
    </div>
  )
}
