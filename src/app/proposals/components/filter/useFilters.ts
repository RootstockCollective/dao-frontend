import { useState, useCallback, useMemo } from 'react'
import { FilterItem, FilterState, FilterActions } from './types'

export const useFilters = (): FilterState & FilterActions => {
  const [activeFilters, setActiveFilters] = useState<FilterItem[]>([])
  const [searchValue, setSearchValue] = useState('')

  const addFilter = useCallback((filter: Omit<FilterItem, 'id'>) => {
    const newFilter: FilterItem = {
      ...filter,
      id: `${filter.type}-${filter.value}-${Date.now()}`,
    }

    setActiveFilters(prev => {
      // Don't add duplicate filters
      const exists = prev.some(f => f.type === filter.type && f.value === filter.value)
      if (exists) return prev
      return [...prev, newFilter]
    })
  }, [])

  const removeFilter = useCallback((id: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== id))
  }, [])

  const removeFilterByValue = useCallback((value: string) => {
    setActiveFilters(prev => prev.filter(f => f.value !== value))
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters([])
    setSearchValue('')
  }, [])

  const updateSearchValue = useCallback((value: string) => {
    setSearchValue(value)

    // Update search filter in active filters
    if (value.trim()) {
      setActiveFilters(prev => {
        // Remove any existing search filters first
        const withoutSearch = prev.filter(f => f.type !== 'search')
        // Add the new search filter
        return [
          ...withoutSearch,
          {
            id: `search-${value.trim()}-${Date.now()}`,
            type: 'search' as const,
            label: value.trim(),
            value: value.trim(),
          },
        ]
      })
    } else {
      // Remove search filters when search is cleared
      setActiveFilters(prev => prev.filter(f => f.type !== 'search'))
    }
  }, [])

  return {
    activeFilters,
    searchValue,
    addFilter,
    removeFilter,
    removeFilterByValue,
    clearAllFilters,
    updateSearchValue,
  }
}
