import { useState, useCallback } from 'react'
import { FilterItem, FilterState, FilterActions, FilterType } from './types'
import { createAllFilters } from './filterOptions'
import { MILESTONE_SEPARATOR } from '@/app/proposals/shared/utils'

export const useProposalFilters = (): FilterState & FilterActions => {
  const [activeFilters, setActiveFilters] = useState<FilterItem[]>(createAllFilters())
  const [searchValue, setSearchValue] = useState('')

  const addFilter = useCallback((newFilter: FilterItem) => {
    setActiveFilters(prev => {
      // If new filter is "all" OR exclusive, remove ALL other filters of same type and add this one
      if (newFilter.isAll || newFilter.exclusive) {
        return prev.filter(f => f.type !== newFilter.type).concat(newFilter)
      }

      // Special handling for milestone filters
      // No 'Grant - all milestones' chosen together with other milestone filters
      if (newFilter.type === FilterType.CATEGORY) {
        if (newFilter.value === MILESTONE_SEPARATOR) {
          // "All milestones" selected - remove all other milestone filters
          return prev
            .filter(
              f =>
                f.type !== newFilter.type ||
                f.value === MILESTONE_SEPARATOR ||
                !f.value.startsWith(MILESTONE_SEPARATOR),
            )
            .concat(newFilter)
        }
        if (newFilter.value.startsWith(MILESTONE_SEPARATOR) && newFilter.value !== MILESTONE_SEPARATOR) {
          // Specific milestone selected - remove "all milestones" filter
          return prev
            .filter(f => f.type !== newFilter.type || f.value !== MILESTONE_SEPARATOR)
            .concat(newFilter)
        }
      }

      // For regular filters, add the new filter and remove any "all" filter of the same type
      return prev
        .filter(f => f.type !== newFilter.type || (!f.isAll && f.id !== newFilter.id))
        .concat(newFilter)
    })
  }, [])

  const removeFilter = useCallback(
    (id: string) => {
      const filter = activeFilters.find(f => f.id === id)
      if (filter && !filter.isAll) {
        setActiveFilters(prev => {
          // Remove the current filter
          const result = prev.filter(f => f.id !== id)

          // Check if there are any remaining filters of the same type
          const hasFiltersOfSameType = result.some(f => f.type === filter.type)

          // If no remaining filters of this type exist, restore the "all" filter
          if (!hasFiltersOfSameType) {
            const allFilters = createAllFilters()
            const isAllFilter = allFilters.find(f => f.type === filter.type)
            if (isAllFilter) {
              result.push(isAllFilter)
            }
          }

          return result
        })
      }
    },
    [activeFilters],
  )

  const clearAllFilters = useCallback(() => {
    setActiveFilters(createAllFilters())
    setSearchValue('')
  }, [])

  const updateSearchValue = useCallback((value: string) => {
    value = value.trim()
    setSearchValue(value)

    if (value) {
      setActiveFilters(prev => {
        // Remove any existing search filters first
        const filters = prev.filter(f => f.type !== FilterType.SEARCH)

        // Add new search filter
        filters.push({
          id: `search-${value}-${Date.now()}`,
          type: FilterType.SEARCH,
          label: value,
          value,
        })
        return filters
      })
    } else {
      // Remove search filters when search is cleared
      setActiveFilters(prev => prev.filter(f => f.type !== FilterType.SEARCH))
    }
  }, [])

  return {
    activeFilters,
    searchValue,
    addFilter,
    removeFilter,
    clearAllFilters,
    updateSearchValue,
  }
}
