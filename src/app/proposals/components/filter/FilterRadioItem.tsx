import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FilterOption } from './filterOptions'

interface Props {
  option: FilterOption
  selected: boolean
  onClick: (option: FilterOption['value']) => void
}

/**
 * Individual radio button item for selecting proposal filter categories
 */
export const FilterRadioItem = ({ option, selected, onClick, ...props }: Props) => {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={() => onClick(option.value)}
      className={cn('group focus:outline-none focus-visible:outline-none', 'flex gap-3 items-center')}
      {...props}
    >
      <div
        className={cn(
          'w-4 h-4 rounded-xs transition-all border-text-100',
          !selected && 'group-focus:outline group-focus:outline-text-100',
          selected ? 'border-5' : 'border-[1.5px]',
        )}
      />
      <Paragraph>{option.label}</Paragraph>
    </button>
  )
}
