import { FC } from 'react'
import { KotoChevronDownIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'

export const ExpandChevron: FC<{
  isExpanded: boolean
  onToggle?: () => void
  className?: string
}> = ({ isExpanded, onToggle, className }) => (
  <KotoChevronDownIcon
    size={16}
    className={cn(
      'transition-transform duration-100 text-v3-text-100',
      isExpanded ? 'rotate-180' : 'rotate-0',
      className,
    )}
    onClick={e => {
      onToggle?.()
      e.stopPropagation()
    }}
  />
)
