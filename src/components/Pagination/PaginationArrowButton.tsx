import { Chevron } from './Chevron'
import { cn } from '@/lib/utils'

interface PaginationArrowButtonProps {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
  'data-testid'?: string
}

// Arrow button for pagination navigation
export default function PaginationArrowButton({
  direction,
  disabled,
  onClick,
  'data-testid': dataTestId,
}: PaginationArrowButtonProps) {
  return (
    <button
      aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      tabIndex={0}
      disabled={disabled}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <Chevron className={cn(direction === 'next' && 'rotate-180')} active={!disabled} />
    </button>
  )
}
