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
  /**
   * Optional function to set the clear handler.
   * This is useful when the parent component needs to clear the search input.
   */
  onClearHandler?: (handler: () => void) => void
  maxLength?: number
}

const SPINNER_DEBOUNCE_MS = 300 // Delay after the user stops typing before showing the spinner
const SEARCH_DEBOUNCE_MS = 700 // Additional delay before finalizing input and calling onSearchSubmit

/**
 * DebounceSearch component that uses two levels of debouncing to control user experience:
 *
 * 1. The first debounce (300ms) detects when the user has stopped typing and shows a spinner
 *    indicating that the application is "thinking."
 * 2. The second debounce (700ms after the first debounce) finalizes the input, hides the spinner,
 *    and triggers the onSearchSubmit function.
 *
 * This design ensures the spinner is only displayed after the user stops typing, creating a
 * smooth and responsive UX. It prevents unnecessary actions or spinner flickering while typing.
 */
export function DebounceSearch({
  onSearchSubmit,
  placeholder = 'Search',
  onClearHandler,
  maxLength = 100,
}: ProposalSearchProps) {
  const [searchText, setSearchText] = useState('')
  // First debounce runs shortly after user stops typing. It launches spinner
  const [isUserStoppedTyping] = useDebounce(searchText, SPINNER_DEBOUNCE_MS)
  // Second debounce runs after the first one. When it finishes, it stops the spinner and calls on-search function
  const [debouncedSearchText] = useDebounce(isUserStoppedTyping, SEARCH_DEBOUNCE_MS)
  // shows/hides spinner
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    // Show the spinner as soon as the user stops typing
    setIsLoading(true)
  }, [isUserStoppedTyping])
  useEffect(() => {
    // Hide the spinner and trigger the search function after the second debounce
    setIsLoading(false)
    onSearchSubmit(debouncedSearchText)
  }, [debouncedSearchText, onSearchSubmit])

  const handleClear = () => {
    setSearchText('')
  }
  const handleChange = (val: string) => {
    setSearchText(val)
  }
  useEffect(() => {
    onClearHandler?.(handleClear)
  }, [onClearHandler])
  return (
    <Input
      value={searchText}
      onChange={handleChange}
      name="debounceSearch"
      placeholder={placeholder}
      fullWidth
      type="search"
      className="my-5"
      onClear={searchText ? handleClear : undefined}
      loading={isLoading}
      inputProps={{ maxLength }}
    />
  )
}
