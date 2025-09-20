import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'
import { FilterItem } from './types'
import { SelectableItem } from '@/components/SelectableItem'

interface FilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  filterOptions: Record<string, FilterItem[]>
  activeFilters: FilterItem[]
  onAddFilter: (filter: FilterItem) => void
  onRemoveFilter: (id: string) => void
}

/**
 * Sidebar panel containing radio button filters for proposal categories
 */
export function FilterSideBar({
  filterOptions,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  className,
  ...props
}: FilterSideBarProps) {
  const handleFilterToggle = (option: FilterItem) => {
    if (activeFilters.some(f => f.id === option.id)) {
      onRemoveFilter(option.id)
    } else {
      onAddFilter(option)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col w-[256px] h-full pt-[56px] pb-4 px-6 bg-bg-60 rounded-sm gap-10',
        className,
      )}
      {...props}
    >
      {Object.keys(filterOptions).map(type => (
        <div key={type} className="flex flex-col gap-4">
          <Header id="filter-title" variant="h5" className="text-text-40" caps>
            Filter by {type}
          </Header>
          <ul className="pl-1 space-y-3" role="group" aria-labelledby="filter-title">
            {(filterOptions[type as keyof typeof filterOptions] as FilterItem[]).map(option => (
              <li key={option.id} data-testid={`FilterOption-${option.label}`}>
                <SelectableItem
                  selected={activeFilters.some(f => f.id === option.id)}
                  option={{ label: option.label, value: option.id }}
                  onClick={() => handleFilterToggle(option)}
                  data-testid={`FilterOption-${option.label}`}
                  variant="round"
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
