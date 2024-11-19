'use client'

import { Input } from '@/components/Input'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

interface ProposalSearchProps {
  /**
   * Function to handle search input updates after debounce.
   */
  onSearchSubmit: (val: string) => void
  /**
   * Placeholder text for the search input.
   */
  placeholder: string
}

/**
 * DebounceSearch component allows delayed submission of search input to the parent.
 * It includes a "clear" button to reset the search field.
 */
export function DebounceSearch({ onSearchSubmit, placeholder = 'Search' }: ProposalSearchProps) {
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText] = useDebounce(searchText, 1000)
  const handleClear = () => {
    setSearchText('')
  }
  const handleChange = (val: string) => {
    setSearchText(val)
  }
  useEffect(() => onSearchSubmit(debouncedSearchText), [debouncedSearchText, onSearchSubmit])
  return (
    <Input
      value={searchText}
      onChange={handleChange}
      name="debounceSearch"
      placeholder={placeholder}
      fullWidth
      type="search"
      className="my-5"
      onClear={handleClear}
    />
  )
}
