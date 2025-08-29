'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode, createContext, useContext, useState } from 'react'
import { KotoChevronDownIcon } from '../Icons'

// Context for sharing state between compound components
interface ExpandableContextType {
  isExpanded: boolean
  toggleExpanded: () => void
}

const ExpandableContext = createContext<ExpandableContextType | null>(null)

const useExpandableContext = () => {
  const context = useContext(ExpandableContext)
  if (!context) {
    throw new Error('Expandable compound components must be used within ExpandableContent')
  }
  return context
}

// Main container component
interface ExpandableProps {
  children: ReactNode
  className?: string
  dataTestId?: string
  expanded?: boolean
}

export const Expandable: FC<ExpandableProps> = ({ children, className, dataTestId, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const toggleExpanded = () => setIsExpanded(!isExpanded)

  return (
    <ExpandableContext.Provider value={{ isExpanded, toggleExpanded }}>
      <div className={cn('flex flex-col gap-2', className)} data-testid={dataTestId}>
        {children}
      </div>
    </ExpandableContext.Provider>
  )
}

// Header section (always visible)
interface ExpandableHeaderProps {
  children: ReactNode
  className?: string
  triggerColor?: string
}

export const ExpandableHeader: FC<ExpandableHeaderProps> = ({ children, className, triggerColor }) => {
  return (
    <div className={cn('flex flex-row justify-between items-start gap-4', className)}>
      {children}
      <ExpandableTrigger color={triggerColor} />
    </div>
  )
}

// Footer section (always visible)
interface ExpandableFooterProps {
  children: ReactNode
  className?: string
}

export const ExpandableFooter: FC<ExpandableFooterProps> = ({ children, className }) => {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}

// Expandable trigger button (always shows chevron, only on mobile)
interface ExpandableTriggerProps {
  className?: string
  color?: string
}

export const ExpandableTrigger: FC<ExpandableTriggerProps> = ({ className, color }) => {
  const { isExpanded, toggleExpanded } = useExpandableContext()

  return (
    <button
      className={cn('flex items-center', className)}
      onClick={toggleExpanded}
      aria-expanded={isExpanded}
    >
      <span className={cn('transition-transform', isExpanded ? 'rotate-180' : '')}>
        <KotoChevronDownIcon color={color} />
      </span>
    </button>
  )
}

// Expandable content section
interface ExpandableContentProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export const ExpandableContent: FC<ExpandableContentProps> = ({ children, className, contentClassName }) => {
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

// Convenience component for the entire expandable structure
interface ExpandableComponentProps {
  alwaysVisible: ReactNode
  expandable: ReactNode
  className?: string
  contentClassName?: string
  footer?: ReactNode
}

export const ExpandableComponent: FC<ExpandableComponentProps> = ({
  alwaysVisible,
  expandable,
  className,
  contentClassName,
  footer,
}) => {
  return (
    <Expandable className={className}>
      <ExpandableHeader>{alwaysVisible}</ExpandableHeader>
      {expandable && <ExpandableContent contentClassName={contentClassName}>{expandable}</ExpandableContent>}
      {footer && <ExpandableFooter>{footer}</ExpandableFooter>}
    </Expandable>
  )
}
