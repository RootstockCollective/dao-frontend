import { cn } from '@/lib/utils'

interface StepDotsProps {
  /** Total number of steps in the flow. */
  total: number
  /** Zero-based index of the active step. */
  current: number
  className?: string
  'data-testid'?: string
}

/**
 * Segmented step indicator for short wizards.
 *
 * Every segment up to and including `current` is filled, so the control reads as
 * progress rather than as a set of independent dots.
 *
 * Renders nothing when there is a single step — one segment carries no information.
 * Decorative by design: the surrounding "STEP i OF N" copy is what screen readers announce.
 */
export const StepDots = ({
  total,
  current,
  className,
  'data-testid': dataTestId = 'step-dots',
}: StepDotsProps) => {
  if (total <= 1) {
    return null
  }

  return (
    <div className={cn('flex flex-row items-center gap-1', className)} aria-hidden data-testid={dataTestId}>
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index <= current

        return (
          <span
            key={index}
            className={cn(
              'h-1 w-8 rounded-full transition-colors duration-300',
              isFilled ? 'bg-primary' : 'bg-bg-20',
            )}
            data-filled={isFilled}
            data-testid={`${dataTestId}-segment-${index}`}
          />
        )
      })}
    </div>
  )
}
