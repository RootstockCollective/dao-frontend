import { FilterChip } from './FilterChip'
import { FilterItem, FilterType } from './types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Header, Span } from '@/components/Typography'

interface ActiveFiltersDisplayProps {
  activeFilters: FilterItem[]
  onRemoveFilter: (id: string) => void
  onClearAll: () => void
  className?: string
}

export const ActiveFiltersDisplay = ({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  className,
}: ActiveFiltersDisplayProps) => {
  // Filter out "all" filters and search filters for display
  const displayFilters = activeFilters.filter(f => !f.isAll && f.type !== FilterType.SEARCH)
  const searchFilters = activeFilters.filter(f => f.type === FilterType.SEARCH)

  if (displayFilters.length === 0 && searchFilters.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3 md:hidden', className)} data-testid="ActiveFiltersDisplay">
      {/* Non-Search Filters (Category, Status, Time) */}
      {displayFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto">
          <Header variant="h5" className="text-text-40 whitespace-nowrap flex-shrink-0">
            FILTERED BY:
          </Header>
          <div className="flex items-center gap-2 min-w-0">
            {displayFilters.map(filter => (
              <FilterChip key={filter.id} filter={filter} onRemove={onRemoveFilter} />
            ))}
          </div>
        </div>
      )}

      {/* Search Filters */}
      {searchFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto">
          <Header variant="h5" className="text-text-40 whitespace-nowrap flex-shrink-0">
            SEARCHED FOR:
          </Header>
          <div className="flex items-center gap-2 min-w-0">
            {searchFilters.map(filter => (
              <FilterChip key={filter.id} filter={filter} onRemove={onRemoveFilter} />
            ))}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {activeFilters.some(f => !f.isAll) && (
        <div className="pt-2">
          <Button
            onClick={onClearAll}
            variant="transparent"
            className="hover:text-text transition-colors p-0 h-auto"
            data-testid="ClearAllFilters"
          >
            <Span variant="body-s" className="text-text-60 underline">
              Clear all filters
            </Span>
          </Button>
        </div>
      )}
    </div>
  )
}
