import { ReactNode } from 'react'

import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

interface BackingInfoContainerProps extends CommonComponentProps {
  title: ReactNode
}

export const BackingInfoContainer = ({ className = '', title, children }: BackingInfoContainerProps) => {
  return (
    <div className={cn('relative flex w-full flex-col bg-v3-bg-accent-80 rounded p-4 md:p-6', className)}>
      <div className="flex flex-1 flex-col gap-6">
        {title}
        {/* Grows so the banner artwork fills the card instead of leaving a gap when collapsed */}
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
