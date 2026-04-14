import { KotoChevronDownIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'

export const ExpandChevron = ({
  isExpanded,
  onToggle,
  className,
  isRowSelected = false,
}: {
  isExpanded: boolean
  onToggle?: () => void
  className?: string
  isRowSelected?: boolean
}) => (
  <KotoChevronDownIcon
    size={16}
    className={cn(
      'transition-transform duration-100',
      isRowSelected ? 'text-v3-bg-accent-100' : 'text-v3-text-100',
      isExpanded ? 'rotate-180' : 'rotate-0',
      className,
    )}
    onClick={e => {
      onToggle?.()
      e.stopPropagation()
    }}
  />
)
