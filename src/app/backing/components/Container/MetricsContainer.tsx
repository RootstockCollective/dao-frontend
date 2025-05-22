import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../commonProps'

export type MetricsContainerProps = CommonComponentProps & PropsWithChildren

export const MetricsContainer: FC<MetricsContainerProps> = ({ dataTestid, className = '', children }) => {
  return (
    <div
      data-testid={`${dataTestid}_MetricsContainer`}
      className={cn(
        'flex flex-col justify-center items-center gap-2 shrink-0 self-stretch w-[17.5rem] pt-[4.06rem] pb-[4.06rem] pl-6 pr-6 rounded-sm bg-v3-bg-accent-80',
        className,
      )}
    >
      {children}
    </div>
  )
}
