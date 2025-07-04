import { MAX_PAGE_SIZE } from '@/lib/constants'

export function parsePaginationParams(url: string) {
  const { searchParams } = new URL(url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new Error('Invalid page or pageSize')
  }

  return { page, pageSize }
}
