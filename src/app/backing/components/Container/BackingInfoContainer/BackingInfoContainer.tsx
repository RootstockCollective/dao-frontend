import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

export interface BackingInfoContainerProps extends CommonComponentProps {
  title: ReactNode
}

export const BackingInfoContainer: FC<BackingInfoContainerProps> = ({ className = '', title, children }) => {
  return (
    <div className={cn('relative w-full bg-v3-bg-accent-80 rounded p-6', className)}>
      <div className="flex flex-col gap-[56px]">
        {title}
        {children}
      </div>
    </div>
  )
}
