import { cn } from '@/lib/utils'

export interface Props {
  id: number
  name: string
  selected: boolean
  onClick: (id: number) => void
}

/**
 * Individual radio button item for selecting proposal filter categories
 */
export const FilterRadioItem = ({ id, name, selected, onClick }: Props) => {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={() => onClick(id)}
      className={cn('group focus:outline-none focus-visible:outline-none', 'flex gap-3 items-center')}
    >
      <div
        className={cn(
          'w-4 h-4 rounded-xs transition-all border-text-100',
          !selected && 'group-focus:outline group-focus:outline-text-100',
          selected ? 'border-5' : 'border-[1.5px]',
        )}
      />
      <p className="font-rootstock-sans text-text-100">{name}</p>
    </button>
  )
}
