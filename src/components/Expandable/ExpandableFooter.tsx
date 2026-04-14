'use client'
import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

// Footer section (always visible)
interface Props {
  children: ReactNode
  className?: string
}

/**
 * Expandable footer section.
 * This component MUST be used inside the Expandable component.
 */
export const ExpandableFooter = ({ children, className }: Props) => {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}
