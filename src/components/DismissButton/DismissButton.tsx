import { CloseIconKoto } from '@/components/Icons'
import { cn } from '@/lib/utils'

export interface DismissButtonProps {
  /** Describes what gets dismissed, e.g. "Dismiss the Builders banner". */
  'aria-label': string
  onClick: () => void
  /** The surface the button sits on, which decides the icon and border color. */
  variant?: 'onDark' | 'onLight'
  className?: string
  'data-testid'?: string
}

/**
 * The close control shared by every dismissible banner and notification:
 * a small square with rounded corners.
 */
export const DismissButton = ({
  'aria-label': ariaLabel,
  onClick,
  variant = 'onDark',
  className,
  'data-testid': dataTestId,
}: DismissButtonProps) => {
  const isOnDark = variant === 'onDark'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded transition-colors',
        isOnDark
          ? 'border border-v3-text-100/20 hover:bg-v3-text-100/10'
          : 'border border-v3-bg-accent-100/15 hover:bg-v3-bg-accent-100/5',
        className,
      )}
    >
      <CloseIconKoto
        size={16}
        color={isOnDark ? 'var(--color-v3-text-100)' : 'var(--color-v3-bg-accent-100)'}
      />
    </button>
  )
}
