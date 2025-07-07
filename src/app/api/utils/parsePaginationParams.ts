import { MAX_PAGE_SIZE } from '@/lib/constants'

export type ValidationError = {
  type: 'ValidationError'
  message: string
  statusCode: number
}

export type PaginationParams = {
  page: number
  pageSize: number
}

export type PaginationResult =
  | { success: true; data: PaginationParams }
  | { success: false; error: ValidationError }

export function parsePaginationParams(url: string): PaginationResult {
  const { searchParams } = new URL(url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

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

  return {
    success: true,
    data: { page, pageSize },
  }
}
