import { describe, expect, it } from 'vitest'

import { MAX_PAGE_SIZE, MAX_PAGINATION_OFFSET } from '@/lib/constants'

import { parsePaginationParams } from './parsePaginationParams'

const url = (query: string) => `http://localhost/api/backers?${query}`

describe('parsePaginationParams', () => {
  it('parses page, pageSize and sortDirection with defaults', () => {
    const result = parsePaginationParams(url(''))

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBeGreaterThanOrEqual(1)
      expect(result.data.pageSize).toBeGreaterThanOrEqual(1)
    }
  })

  it('rejects a pageSize above the maximum', () => {
    const result = parsePaginationParams(url(`pageSize=${MAX_PAGE_SIZE + 1}`))

    expect(result).toMatchObject({ success: false, error: { statusCode: 400 } })
  })

  it('rejects a page that would reach past the deepest allowed offset', () => {
    const page = Math.floor(MAX_PAGINATION_OFFSET / MAX_PAGE_SIZE) + 1
    const result = parsePaginationParams(url(`page=${page}&pageSize=${MAX_PAGE_SIZE}`))

    expect(result).toMatchObject({
      success: false,
      error: { statusCode: 400, message: expect.stringContaining('page * pageSize') },
    })
  })

  it('accepts the deepest allowed page', () => {
    const page = Math.floor(MAX_PAGINATION_OFFSET / MAX_PAGE_SIZE)
    const result = parsePaginationParams(url(`page=${page}&pageSize=${MAX_PAGE_SIZE}`))

    expect(result.success).toBe(true)
  })

  it('rejects a sortBy column that is not allow-listed', () => {
    const result = parsePaginationParams(url('sortBy=password'), ['createdAt'])

    expect(result).toMatchObject({ success: false, error: { message: 'Invalid sortBy parameter' } })
  })
})
