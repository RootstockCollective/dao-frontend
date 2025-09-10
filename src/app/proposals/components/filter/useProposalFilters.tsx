'use client'

import { useCallback, useState } from 'react'
import { createSearchFilter, filterOptions } from './filterOptions'
import { FilterActions, FilterItem, FilterState, FilterType } from './types'

const initialFilters = Object.values(filterOptions)
  .flat()
  .filter(f => f.exclusive)

export const useProposalFilters = (): FilterState & FilterActions => {
  const [activeFilters, setActiveFilters] = useState<FilterItem[]>(initialFilters)
  const [searchValue, setSearchValue] = useState('')

  const addFilter = useCallback((newFilter: FilterItem) => {
    setActiveFilters(prev => {
      if (newFilter.exclusive) {
        return prev.filter(f => f.type !== newFilter.type).concat(newFilter)
      }
      return prev
        .filter(f => f.type !== newFilter.type || (!f.exclusive && f.id !== newFilter.id))
        .concat(newFilter)
    })
  }, [])

  const removeFilter = useCallback(
    (id: string) => {
      const filter = activeFilters.find(f => f.id === id)
      if (!filter?.exclusive) {
        setActiveFilters(prev => prev.filter(f => f.id !== id))
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
