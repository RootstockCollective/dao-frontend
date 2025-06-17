import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'
import { FilterRadioItem } from './FilterRadioItem'

export interface FilterOption {
  id: number
  name: string
}

interface FilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  filterOptions: FilterOption[]
  currentFilter: number
  setCurrentFilter: (optionId: number) => void
  title?: string
}

/**
 * Sidebar panel containing radio button filters for proposal categories
 */
export function FilterSideBar({
  filterOptions,
  currentFilter,
  setCurrentFilter,
  className,
  title = 'Filter by category',
  ...props
}: FilterSideBarProps) {
  return (
    <div className={cn('w-[256px] pt-[56px] pb-4 px-6 bg-bg-60 rounded-sm', className)} {...props}>
      <h3
        id="filter-title"
        className="mb-4 font-rootstock-sans text-xs font-medium tracking-wider uppercase text-text-40"
      >
        {title}
      </h3>
      <ul className="pl-1 space-y-3" role="radiogroup" aria-labelledby="filter-title">
        {filterOptions.map(({ id, name }) => (
          <li key={id}>
            <FilterRadioItem selected={id === currentFilter} id={id} name={name} onClick={setCurrentFilter} />
          </li>
        ))}
      </ul>
    </div>
  )
}
