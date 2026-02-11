/**
 * Standard pagination response structure for API endpoints
 */
export interface PaginationResponse {
  page: number
  limit: number
  offset: number
  total: number
  sort_field: string
  sort_direction: 'asc' | 'desc'
  totalPages?: number
}
