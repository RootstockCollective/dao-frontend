'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode, useState } from 'react'
import { ExpandableContext } from './ExpandableContext'

// Main container component
interface Props {
  children: ReactNode
  className?: string
  dataTestId?: string
  // Initial expanded state (defaults to false)
  expanded?: boolean
  // Callback function called when the expanded state changes
  onToggleExpanded?: (isExpanded: boolean) => void
}

/**
 * Expandable component that provides collapsible content functionality.
 *
 * This component creates an expandable container that can show/hide content
 * with smooth animations. It uses React context to manage the expanded state
 * and provides a toggle mechanism for child components.
 *
 * @example
 * ```tsx
 * <Expandable
 *   className="border rounded-lg p-4"
 *   onToggleExpanded={(isExpanded) => console.log('Expanded:', isExpanded)}
 * >
 *   <ExpandableHeader>
 *     <h3>Click to expand</h3>
 *   </ExpandableHeader>
 *   <ExpandableContent>
 *     <p>This content is hidden by default and can be toggled.</p>
 *     <p>More content here...</p>
 *   </ExpandableContent>
 *   <ExpandableFooter>
 *     <p>Footer content here...</p>
 *   </ExpandableFooter>
 * </Expandable>
 * ```
 */
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
