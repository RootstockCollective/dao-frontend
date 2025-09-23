'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode, useState } from 'react'
import { ExpandableContext } from './ExpandableContext'

// Main container component
interface Props {
  children: ReactNode
  className?: string
  dataTestId?: string
  expanded?: boolean
  onToggleExpanded?: (isExpanded: boolean) => void
}

export const Expandable: FC<Props> = ({
  children,
  className,
  dataTestId,
  expanded = false,
  onToggleExpanded,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    onToggleExpanded?.(!isExpanded)
  }

  return (
    <ExpandableContext.Provider value={{ isExpanded, toggleExpanded }}>
      <div className={cn('flex flex-col gap-2', className)} data-testid={dataTestId}>
        {children}
      </div>
    </ExpandableContext.Provider>
  )
}
