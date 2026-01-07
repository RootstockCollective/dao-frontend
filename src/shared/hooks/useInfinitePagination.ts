import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  QueryFunctionContext,
} from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'

interface PaginatedResponse<T> {
  items: T[]
  [key: string]: unknown
}

interface UseInfinitePaginatedQueryOptions<
  T,
  TPageParam = unknown,
  TResponse extends { items: T[] } = PaginatedResponse<T>,
> {
  queryKey: string[]
  queryFn: (context: QueryFunctionContext<string[], TPageParam>) => Promise<TResponse>
  getNextPageParam: (lastPage: TResponse) => TPageParam | undefined
  initialPageParam: TPageParam
  resultsPerTablePage: number
}

interface UseInfinitePaginatedQueryResult<T>
  extends Omit<UseInfiniteQueryResult<InfiniteData<PaginatedResponse<T>>>, 'data'> {
  currentResults: T[]
  tablePage: number
  totalPages: number
  nextTablePage: () => void
  previousTablePage: () => void
  goToTablePage: (pageNumber: number) => void
  isFirstFetch: boolean
  hasMorePages: boolean
}

export function useInfinitePagination<
  T,
  TPageParam = unknown,
  TResponse extends { items: T[] } = PaginatedResponse<T>,
>({
  queryKey,
  queryFn,
  getNextPageParam,
  initialPageParam,
  resultsPerTablePage,
}: UseInfinitePaginatedQueryOptions<T, TPageParam, TResponse>): UseInfinitePaginatedQueryResult<T> {
  const [tablePage, setTablePage] = useState(0)
  const [isFirstFetch, setIsFirstFetch] = useState(true)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...restQueryResult } = useInfiniteQuery<
    TResponse,
    Error,
    InfiniteData<TResponse>,
    string[],
    TPageParam
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
    // If no data yet, assume there are more pages (initial fetch)
    if (!data || data.pages.length === 0) return true
    // Otherwise use TanStack Query's hasNextPage
    return hasNextPage ?? false
  }, [data, hasNextPage])

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
