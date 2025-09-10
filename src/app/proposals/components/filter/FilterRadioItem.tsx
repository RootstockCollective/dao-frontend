import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  selected: boolean
  onClick: (label: string) => void
}

/**
 * Individual radio button item for selecting proposal filter categories
 */
export const FilterRadioItem = ({ label, selected, onClick }: Props) => {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={() => onClick(label)}
      className={cn('group focus:outline-none focus-visible:outline-none', 'flex gap-3 items-center')}
    >
      <div
        className={cn(
          'w-4 h-4 rounded-xs transition-all border-text-100',
          !selected && 'group-focus:outline group-focus:outline-text-100',
          selected ? 'border-5' : 'border-[1.5px]',
        )}
      />
      <Paragraph>{label}</Paragraph>
    </button>
  )
}
