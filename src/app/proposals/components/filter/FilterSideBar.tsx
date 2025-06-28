import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'
import { FilterRadioItem } from './FilterRadioItem'

interface FilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  currentFilter: string
  setCurrentFilter: (option: string) => void
  title?: string
  filterOptions: string[]
}

/**
 * Sidebar panel containing radio button filters for proposal categories
 */
export function FilterSideBar({
  currentFilter,
  setCurrentFilter,
  className,
  title = 'Filter by category',
  filterOptions,
  ...props
}: FilterSideBarProps) {
  return (
    <div className={cn('w-[256px] h-full pt-[56px] pb-4 px-6 bg-bg-60 rounded-sm', className)} {...props}>
      <h3
        id="filter-title"
        className="mb-4 font-rootstock-sans text-xs font-medium tracking-wider uppercase text-text-40"
      >
        {title}
      </h3>
      <ul className="pl-1 space-y-3" role="radiogroup" aria-labelledby="filter-title">
        <li>
          <FilterRadioItem
            selected={!currentFilter}
            option="All categories"
            onClick={() => setCurrentFilter('')}
          />
        </li>
        {filterOptions.map((option, i) => (
          <li key={i}>
            <FilterRadioItem selected={option === currentFilter} option={option} onClick={setCurrentFilter} />
          </li>
        ))}
      </ul>
    </div>
  )
}
