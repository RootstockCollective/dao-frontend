import { Chevron } from './Chevron'
import { cn } from '@/lib/utils'

interface PaginationArrowButtonProps {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}

// Arrow button for pagination navigation
export default function PaginationArrowButton({ direction, disabled, onClick }: PaginationArrowButtonProps) {
  return (
    <button
      aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      tabIndex={0}
      disabled={disabled}
      onClick={onClick}
    >
      <Chevron className={cn(direction === 'next' && 'rotate-180')} active={!disabled} />
    </button>
  )
}
