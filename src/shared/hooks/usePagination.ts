import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'

interface PaginatedResponse<T> {
  items: T[]
  [key: string]: any
}

interface UsePaginatedQueryOptions<T> {
  queryKey: string[]
  queryFn: (pageParam: any) => Promise<PaginatedResponse<T>>
  getNextPageParam: (lastPage: PaginatedResponse<T>) => any
  initialPageParam: any
  resultsPerTablePage: number
  hasMorePagesProperty: keyof PaginatedResponse<T>
}

export interface UsePaginatedQueryResult<T>
  extends Omit<UseInfiniteQueryResult<InfiniteData<PaginatedResponse<T>>>, 'data'> {
  currentResults: T[]
  tablePage: number
  totalPages: number
  nextTablePage: () => void
  previousTablePage: () => void
  isFirstFetch: boolean
  hasMorePages: boolean
  goToTablePage: (pageNumber: number) => void
}

export function usePagination<T>({
  queryKey,
  queryFn,
  getNextPageParam,
  initialPageParam,
  resultsPerTablePage,
  hasMorePagesProperty,
}: UsePaginatedQueryOptions<T>): UsePaginatedQueryResult<T> {
  const [tablePage, setTablePage] = useState(0)
  const [isFirstFetch, setIsFirstFetch] = useState(true)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...restQueryResult } = useInfiniteQuery<
    PaginatedResponse<T>,
    Error
  >({
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam,
    refetchOnWindowFocus: false,
  })

  const allItems = useMemo(() => {
    return data?.pages.flatMap(page => page.items) || []
  }, [data])

  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / resultsPerTablePage)

  const currentResults = useMemo(() => {
    const start = tablePage * resultsPerTablePage
    const end = start + resultsPerTablePage
    return allItems.slice(start, end)
  }, [allItems, tablePage, resultsPerTablePage])

  const nextTablePage = useCallback(() => {
    if (tablePage < totalPages - 1) {
      setTablePage(prev => prev + 1)
    }
  }, [tablePage, totalPages])

  const previousTablePage = useCallback(() => {
    if (tablePage > 0) {
      setTablePage(prev => prev - 1)
    }
  }, [tablePage])

  const goToTablePage = useCallback((pageNumber: number) => setTablePage(pageNumber), [])

  const hasMorePages = useMemo(() => {
    if (!data || data.pages.length === 0) return true
    const lastPage = data.pages[data.pages.length - 1]
    return lastPage[hasMorePagesProperty] !== null
  }, [data, hasMorePagesProperty])

  useEffect(() => {
    // Check if we need to fetch the next page
    const currentItemIndex = (tablePage + 1) * resultsPerTablePage
    if (currentItemIndex >= totalItems && hasMorePages && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [tablePage, resultsPerTablePage, totalItems, hasMorePages, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    // Update isFirstFetch
    if (isFirstFetch && data && data.pages.length > 0) {
      setIsFirstFetch(false)
    }
  }, [data, isFirstFetch])

  return {
    currentResults,
    totalPages,
    tablePage,
    nextTablePage,
    previousTablePage,
    isFirstFetch,
    hasMorePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    goToTablePage,
    ...restQueryResult,
  }
}
