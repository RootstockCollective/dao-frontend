import { CloseIconKoto } from '@/components/Icons'
import { cn } from '@/lib/utils'

export interface DismissButtonProps {
  /** Describes what gets dismissed, e.g. "Dismiss the Builders banner". */
  'aria-label': string
  onClick: () => void
  /**
   * The surface the button sits on, which decides the icon and border color. `quiet` is
   * for compact one-line notifications on dark: a muted X with no frame until hovered.
   * `round` and `roundQuiet` are the 44px circles of the Holdings Don't Miss prompt, with
   * and without a hairline frame.
   */
  variant?: 'onDark' | 'onLight' | 'quiet' | 'round' | 'roundQuiet'
  className?: string
  'data-testid'?: string
}

const ROUND_CLASSES =
  'size-11 rounded-full border text-warm-text-soft hover:bg-v3-text-80/10 hover:text-v3-text-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v3-rif-blue'

const VARIANT_CLASSES = {
  onDark: 'size-6 rounded border border-v3-text-100/20 text-v3-text-100 hover:bg-v3-text-100/10',
  onLight:
    'size-6 rounded border border-v3-bg-accent-100/15 text-v3-bg-accent-100 hover:bg-v3-bg-accent-100/5',
  quiet:
    'size-7 rounded-md border border-transparent text-warm-icon hover:border-v3-text-80/22 hover:text-banner-title',
  round: `${ROUND_CLASSES} border-v3-text-80/22`,
  roundQuiet: `${ROUND_CLASSES} border-transparent`,
}

const STROKE_WIDTHS: Partial<Record<NonNullable<DismissButtonProps['variant']>, string>> = {
  quiet: '2',
  round: '2.2',
  roundQuiet: '2.2',
}

/**
 * The close control shared by every dismissible banner and notification:
 * a small square with rounded corners. It is the only X banners should use, so
 * that the control looks and sits the same on every screen.
 */
export const DismissButton = ({
  'aria-label': ariaLabel,
  onClick,
  variant = 'onDark',
  className,
  'data-testid': dataTestId,
}: DismissButtonProps) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    data-testid={dataTestId}
    className={cn(
      'flex shrink-0 cursor-pointer items-center justify-center transition-colors',
      "relative before:absolute before:-inset-1.5 before:content-['']",
      VARIANT_CLASSES[variant],
      className,
    )}
  >
    <CloseIconKoto size={14} color="currentColor" strokeWidth={STROKE_WIDTHS[variant]} />
  </button>
)
