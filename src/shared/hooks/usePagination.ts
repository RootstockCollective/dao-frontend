import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useCallback, useMemo, useState } from 'react'

interface UsePaginatedQueryOptions<T> {
  queryKey: string[]
  queryFn: (pageParam: any) => Promise<AxiosResponse<T>>
  resultsPerTablePage: number
}

export interface UsePaginatedQueryResult<T> extends Omit<UseQueryResult<AxiosResponse<T>>, 'data'> {
  currentResults: T[]
  tablePage: number
  totalPages: number
  nextTablePage: () => void
  previousTablePage: () => void
  goToTablePage: (pageNumber: number) => void
}

export function usePagination<T>({
  queryKey,
  queryFn,
  resultsPerTablePage,
}: UsePaginatedQueryOptions<T>): UsePaginatedQueryResult<T> {
  const [tablePage, setTablePage] = useState(0)

  const { data, ...restQueryResult } = useQuery<AxiosResponse<T>, Error>({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  const allItems = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data])

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

  return {
    currentResults,
    totalPages,
    tablePage,
    nextTablePage,
    previousTablePage,
    goToTablePage,
    ...restQueryResult,
  }
}
