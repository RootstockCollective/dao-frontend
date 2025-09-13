import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface SelectableOption {
  label: string
  value: string
}

interface Props {
  option: SelectableOption
  selected: boolean
  onClick: (value: string) => void
  // square is for multiple selection, round is for single selection
  variant?: 'square' | 'round'
}

/**
 * Individual selectable item for filters and options
 * Supports both square (multiple selection) and round (single selection) variants
 * - square: for multiple selection (checkboxes)
 * - round: for single selection (radio buttons)
 */
export const SelectableItem = ({ option, selected, onClick, variant = 'square', ...props }: Props) => {
  return (
    <button
      role={variant === 'round' ? 'radio' : 'checkbox'}
      aria-checked={selected}
      onClick={() => onClick(option.value)}
      className={cn('group focus:outline-none focus-visible:outline-none', 'flex gap-3 items-center')}
      {...props}
    >
      <div
        className={cn(
          'w-4 h-4 transition-all border-text-100',
          variant === 'round' ? 'rounded-full' : 'rounded-xs',
          !selected && 'group-focus:outline group-focus:outline-text-100',
          selected ? 'border-5' : 'border-[1.5px]',
        )}
      />
      <Paragraph>{option.label}</Paragraph>
    </button>
  )
}
