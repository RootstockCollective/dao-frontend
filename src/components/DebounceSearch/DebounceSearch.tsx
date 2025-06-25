'use client'

import { useState, useEffect, HTMLAttributes, RefObject } from 'react'
import { useDebounce } from 'use-debounce'
import { CloseIconKoto, SearchIconKoto, SpinnerIcon } from '../Icons'
import { cn } from '@/lib/utils'

interface ProposalSearchProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Function to handle search input updates after debounce.
   */
  onSearchSubmit: (val: string) => void
  searchValue: string
  /**
   * Placeholder text for the search input.
   */
  placeholder: string
  maxLength?: number
  ref: RefObject<HTMLDivElement | null>
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
  searchValue,
  maxLength = 100,
  className,
  ...props
}: ProposalSearchProps) {
  const [searchText, setSearchText] = useState(searchValue)
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
  return (
    <div className={cn('relative bg-bg-60 rounded-sm', className)} {...props}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {isLoading ? <SpinnerIcon className="animate-spin" /> : <SearchIconKoto />}
      </div>
      <input
        maxLength={maxLength}
        value={searchText}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full py-3 px-12 outline-0 text-text-100 font-rootstock-sans placeholder:text-bg-0"
      />
      <button
        onClick={() => {
          handleClear()
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <CloseIconKoto />
      </button>
    </div>
  )
}
