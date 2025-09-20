'use client'

import { useCallback, useState } from 'react'
import { createSearchFilter, filterOptions } from './filterOptions'
import { FilterActions, FilterItem, FilterState, FilterType } from './types'

const initialFilters = Object.values(filterOptions)
  .flat()
  .filter(f => f.isAll)

export const useProposalFilters = (): FilterState & FilterActions => {
  const [activeFilters, setActiveFilters] = useState<FilterItem[]>(initialFilters)
  const [searchValue, setSearchValue] = useState('')

  const addFilter = useCallback((newFilter: FilterItem) => {
    setActiveFilters(prev => {
      // if new filter is "all" or exclusive, remove other filters of same type and add this one
      if (newFilter.isAll || newFilter.exclusive) {
        return prev.filter(f => f.type !== newFilter.type).concat(newFilter)
      }
      // else, add the new filter and remove any "all" filter of the same type
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
          // remove the current filter
          const result = prev.filter(f => f.id !== id)

          // check if there are any remaining filters of the same type
          const hasFiltersOfSameType = result.some(f => f.type === filter.type)

          // if no remaining filters of this type exist, restore the "all" filter
          if (!hasFiltersOfSameType) {
            const isAllFilter = filterOptions[filter.type]?.find(f => f.isAll)
            // check if "all" filter exists because "search" type has no "all" filter
            if (isAllFilter) {
              result.push(isAllFilter as FilterItem)
            }
          }

          return result
        })
      }
    },
    [activeFilters],
  )

  const clearAllFilters = useCallback(() => {
    setActiveFilters(initialFilters)
    setSearchValue('')
  }, [])

  const updateSearchValue = useCallback((value: string) => {
    value = value.trim()
    setActiveFilters(prev => {
      const filters = prev.filter(f => f.type !== FilterType.SEARCH)
      if (value) {
        filters.push(createSearchFilter(value))
      }
      return filters
    })
    setSearchValue(value)
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
