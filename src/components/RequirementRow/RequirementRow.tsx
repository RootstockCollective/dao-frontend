import { CheckIcon } from '@/components/Icons'
import { Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface RequirementRowProps {
  /** Position shown in the leading badge, 1-based. Replaced by a check once done. */
  position: number
  label: string
  isDone: boolean
  /** Trailing status copy. */
  doneLabel?: string
  pendingLabel?: string
  className?: string
  'data-testid'?: string
}

/**
 * One line of a prerequisite checklist: a numbered badge, a label, and a status.
 *
 * Designed for light surfaces (the cream onboarding panel), where a white card reads as
 * a raised row.
 */
export const RequirementRow = ({
  position,
  label,
  isDone,
  doneLabel = 'Done',
  pendingLabel = 'Not yet',
  className,
  'data-testid': dataTestId = 'requirement-row',
}: RequirementRowProps) => (
  <div
    className={cn('bg-text-100 flex flex-row items-center gap-3 rounded-2xl p-4', className)}
    data-done={isDone}
    data-testid={dataTestId}
  >
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
        isDone ? 'border-success bg-success' : 'border-bg-40',
      )}
      aria-hidden
    >
      {isDone ? (
        <CheckIcon size={16} color="var(--color-text-100)" />
      ) : (
        <Span variant="tag-s" className="text-bg-100">
          {position}
        </Span>
      )}
    </span>

    <Paragraph variant="body-s" bold className="text-bg-100 flex-1">
      {label}
    </Paragraph>

    <Paragraph
      variant="body-s"
      className={isDone ? 'text-success' : 'text-bg-40'}
      data-testid={`${dataTestId}-status`}
    >
      {isDone ? doneLabel : pendingLabel}
    </Paragraph>
  </div>
)
