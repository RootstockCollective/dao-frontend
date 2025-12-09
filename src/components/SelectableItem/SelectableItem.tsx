import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { ReactNode } from 'react'

export interface SelectableOption {
  label: string
  value: string
  icon?: ReactNode
}

interface Props {
  option: SelectableOption
  selected: boolean
  onClick: (value: string) => void
  // square = multi-select, round = single-select
  variant?: 'square' | 'round'
}

/**
 * Individual selectable item for filters and options
 * Supports both square (multiple selection) and round (single selection) variants
 * - square: for multiple selection (checkboxes)
 * - round: for single selection (radio buttons)
 */
export const SelectableItem = ({ option, selected, onClick, variant = 'square', ...props }: Props) => {
  const handleClick = () => {
    if (variant === 'square' || !selected) {
      onClick(option.value)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
  }

  return (
    <button
      role={variant === 'round' ? 'radio' : 'checkbox'}
      aria-checked={selected}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className="group focus:outline-none focus-visible:outline-none flex gap-3 items-center max-w-full"
      {...props}
    >
      <div
        className={cn(
          'w-4 h-4 transition-all border-text-100 shrink-0',
          variant === 'round' ? 'rounded-full' : 'rounded-xs',
          !selected && 'group-focus:outline group-focus:outline-text-100',
          selected ? 'border-5' : 'border-[1.5px]',
        )}
      />
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        {option.icon && <div className="flex items-center shrink-0">{option.icon}</div>}
        <Paragraph className="truncate" title={option.label}>
          {option.label}
        </Paragraph>
      </div>
    </button>
  )
}
