import { useState, useCallback } from 'react'
import { FilterItem, FilterState, FilterActions, FilterType } from './types'
import { createAllFilters, createSearchFilter } from './filterOptions'

export const useProposalFilters = (): FilterState & FilterActions => {
  const [activeFilters, setActiveFilters] = useState<FilterItem[]>(createAllFilters())
  const [searchValue, setSearchValue] = useState('')

  const removeFilter = useCallback(
    (id: string) => {
      const filter = activeFilters.find(f => f.id === id)
      if (filter && !filter.isAll) {
        if (filter.type === FilterType.SEARCH) {
          setSearchValue('')
        }
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

  // Replace all filters at once (used when applying filters from sidebar)
  const setFilters = useCallback((filters: FilterItem[]) => {
    // Preserve search filter if it exists and is not in the new filters
    setActiveFilters(prev => {
      const existingSearchFilter = prev.find(f => f.type === FilterType.SEARCH)
      const hasNewSearchFilter = filters.some(f => f.type === FilterType.SEARCH)

      // If we have an existing search filter and no new one, keep it
      if (existingSearchFilter && !hasNewSearchFilter) {
        // Add "all" filters for types that have no filters selected
        const allFilters = createAllFilters()
        const typesWithFilters = new Set(filters.map(f => f.type))

        const missingAllFilters = allFilters.filter(
          f => !typesWithFilters.has(f.type) && f.type !== FilterType.SEARCH,
        )

        return [...filters, ...missingAllFilters, existingSearchFilter]
      }

      // Add "all" filters for types that have no filters selected
      const allFilters = createAllFilters()
      const typesWithFilters = new Set(filters.map(f => f.type))

      const missingAllFilters = allFilters.filter(f => !typesWithFilters.has(f.type))

      return [...filters, ...missingAllFilters]
    })
  }, [])

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

        // Add new search filter using utility function
        filters.push(createSearchFilter(value))
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
    removeFilter,
    setFilters,
    clearAllFilters,
    updateSearchValue,
  }
}
