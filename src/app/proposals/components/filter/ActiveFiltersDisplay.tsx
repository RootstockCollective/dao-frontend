import { FilterChip } from './FilterChip'
import { FilterItem } from './types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'

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
  if (activeFilters.length === 0) {
    return null
  }

  // Group filters by type for better organization
  const searchFilters = activeFilters.filter(f => f.type === 'search')
  const categoryFilters = activeFilters.filter(f => f.type === 'category')

  return (
    <div className={cn('mb-4 md:hidden', className)} data-testid="ActiveFiltersDisplay">
      {/* Category Filters */}
      {categoryFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto mt-4">
          <Header variant="h5" className="text-text-40 whitespace-nowrap flex-shrink-0">
            FILTERING BY:
          </Header>
          <div className="flex items-center gap-2 min-w-0">
            {categoryFilters.map(filter => (
              <FilterChip key={filter.id} filter={filter} onRemove={onRemoveFilter} />
            ))}
          </div>
        </div>
      )}

      {/* Search Filters */}
      {searchFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto mt-4">
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
      {activeFilters.length > 1 && (
        <div className="pt-2">
          <Button
            onClick={onClearAll}
            variant="transparent"
            className="text-sm text-text-60 hover:text-text transition-colors underline p-0 h-auto"
            data-testid="ClearAllFilters"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
