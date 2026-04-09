'use client'
import { FC, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { useExpandableContext } from './ExpandableContext'
import { ExpandableTrigger } from './ExpandableTrigger'

// Header section (always visible)
interface Props {
  children: ReactNode
  className?: string
  triggerColor?: string
  toggleOnClick?: boolean
}

/**
 * Expandable header section.
 * This component MUST be used inside the Expandable component.
 */
export const ExpandableHeader: FC<Props> = ({ children, className, triggerColor, toggleOnClick = false }) => {
  const { toggleExpanded } = useExpandableContext()
  return (
    <div
      className={cn('flex flex-row justify-between items-start gap-4', className)}
      onClick={toggleOnClick ? toggleExpanded : undefined}
    >
      {children}
      <ExpandableTrigger color={triggerColor} />
    </div>
  )
}
