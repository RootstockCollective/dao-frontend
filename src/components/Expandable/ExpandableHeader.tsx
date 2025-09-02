'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { ExpandableTrigger } from './ExpandableTrigger'

// Header section (always visible)
interface Props {
  children: ReactNode
  className?: string
  triggerColor?: string
}

export const ExpandableHeader: FC<Props> = ({ children, className, triggerColor }) => {
  return (
    <div className={cn('flex flex-row justify-between items-start gap-4', className)}>
      {children}
      <ExpandableTrigger color={triggerColor} />
    </div>
  )
}
