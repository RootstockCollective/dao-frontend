'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { useExpandableContext } from './ExpandableContext'

// Expandable content section
interface Props {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export const ExpandableContent: FC<Props> = ({ children, className, contentClassName }) => {
  const { isExpanded } = useExpandableContext()

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out overflow-hidden',
        isExpanded ? 'max-h-[500px] opacity-100 my-2' : 'max-h-0 opacity-0',
        contentClassName,
      )}
    >
      <div className={className}>{children}</div>
    </div>
  )
}
