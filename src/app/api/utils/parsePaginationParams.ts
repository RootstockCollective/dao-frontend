import { MAX_PAGE_SIZE } from '@/lib/constants'

type ValidationError = {
  type: 'ValidationError'
  message: string
  statusCode: number
}

type PaginationParams = {
  page: number
  pageSize: number
  sortDirection: 'asc' | 'desc'
  sortBy?: string
}

type PaginationResult = { success: true; data: PaginationParams } | { success: false; error: ValidationError }

export function parsePaginationParams(url: string): PaginationResult {
  const { searchParams } = new URL(url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const sortDirection = searchParams.get('sortDirection') || 'asc'
  const sortBy = searchParams.get('sortBy') || undefined

  if (isNaN(page) || page < 1) {
    return {
      success: false,
      error: {
        type: 'ValidationError',
        message: 'Invalid page parameter',
        statusCode: 400,
      },
    }
  }

  if (isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return {
      success: false,
      error: {
        type: 'ValidationError',
        message: 'Invalid pageSize parameter',
        statusCode: 400,
      },
    }
  }

  if (sortDirection !== 'asc' && sortDirection !== 'desc') {
    return {
      success: false,
      error: {
        type: 'ValidationError',
        message: 'Invalid sort parameter',
        statusCode: 400,
      },
    }
  }

  return {
    success: true,
    data: { page, pageSize, sortDirection, sortBy },
  }
}
