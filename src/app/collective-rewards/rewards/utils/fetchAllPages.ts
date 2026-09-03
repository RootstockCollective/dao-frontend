import { MAX_PAGE_SIZE } from '@/lib/constants'

interface PaginatedResponse<T> {
  data: T[]
  count: number
}

/**
 * Fetches every page of a paginated API endpoint and returns the flattened result.
 * Page 1 is fetched first to learn the total `count`, then the remaining pages are
 * fetched in parallel. The page size is owned here so the count math and the
 * requested `pageSize` can never diverge.
 *
 * @param buildUrl - given a 1-based page number and the page size, returns the request URL
 * @param errorMessage - prefix thrown (with the HTTP status) when any page request fails
 */
export async function fetchAllPages<T>(
  buildUrl: (page: number, pageSize: number) => string,
  errorMessage = 'Failed to fetch page',
): Promise<T[]> {
  const firstRes = await fetch(buildUrl(1, MAX_PAGE_SIZE))
  if (!firstRes.ok) throw new Error(`${errorMessage}: ${firstRes.status}`)
  const { data, count }: PaginatedResponse<T> = await firstRes.json()

  const totalPages = Math.ceil(count / MAX_PAGE_SIZE)
  if (totalPages <= 1) return data

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, async (_, i) => {
      const res = await fetch(buildUrl(i + 2, MAX_PAGE_SIZE))
      if (!res.ok) throw new Error(`${errorMessage}: ${res.status}`)
      const page: PaginatedResponse<T> = await res.json()
      return page.data
    }),
  )

  return [...data, ...remaining.flat()]
}
