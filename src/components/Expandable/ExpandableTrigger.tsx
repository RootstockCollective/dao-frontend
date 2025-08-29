'use client'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { KotoChevronDownIcon } from '../Icons'
import { useExpandableContext } from './ExpandableContext'

// Expandable trigger button (always shows chevron, only on mobile)
interface Props {
  className?: string
  color?: string
}

export const ExpandableTrigger: FC<Props> = ({ className, color }) => {
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
