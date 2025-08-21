import { MAX_PAGE_SIZE } from '@/lib/constants'
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DEFAULT_SORT_DIRECTION } from './constants'

type ValidationError = {
  type: 'ValidationError'
  message: string
  statusCode: number
}

const SORT_DIRECTION_ASC = 'asc' as const
const SORT_DIRECTION_DESC = 'desc' as const
const SORT_DIRECTIONS = [SORT_DIRECTION_ASC, SORT_DIRECTION_DESC] as const
type SortDirection = (typeof SORT_DIRECTIONS)[number]
type PaginationParams = {
  page: number
  pageSize: number
  sortDirection: SortDirection
  sortBy?: string
}

type PaginationResult = { success: true; data: PaginationParams } | { success: false; error: ValidationError }

type ParamKey = keyof PaginationParams

const paramConfigs: Record<
  ParamKey,
  {
    name: string
    parse: (value: string | null) => any
    validate?: (value: any) => boolean
    errorMessage?: string
  }
> = {
  page: {
    name: 'page',
    parse: v => parseInt(v ?? DEFAULT_PAGE_NUMBER, 10),
    validate: v => !isNaN(v) && v >= 1,
    errorMessage: 'Invalid page parameter',
  },
  pageSize: {
    name: 'pageSize',
    parse: v => parseInt(v ?? DEFAULT_PAGE_SIZE, 10),
    validate: v => !isNaN(v) && v >= 1 && v <= MAX_PAGE_SIZE,
    errorMessage: 'Invalid pageSize parameter',
  },
  sortDirection: {
    name: 'sortDirection',
    parse: v => v ?? DEFAULT_SORT_DIRECTION,
    validate: v => SORT_DIRECTIONS.includes(v),
    errorMessage: 'Invalid sortDirection parameter',
  },
  sortBy: {
    name: 'sortBy',
    parse: v => v ?? undefined,
    // sortBy validation is handled separately
  },
}

export function parsePaginationParams(url: string, allowedSortColumns?: string[]): PaginationResult {
  const { searchParams } = new URL(url)
  const result: Partial<PaginationParams> = {}

  for (const key of Object.keys(paramConfigs) as ParamKey[]) {
    const config = paramConfigs[key]
    const rawValue = searchParams.get(config.name)
    const parsed = config.parse(rawValue)

    if (config.validate && !config.validate(parsed)) {
      return {
        success: false,
        error: {
          type: 'ValidationError',
          message: config.errorMessage || `Invalid ${key} parameter`,
          statusCode: 400,
        },
      }
    }

    result[key] = parsed
  }

  // Extra validation for sortBy
  if (result.sortBy && !allowedSortColumns?.includes(result.sortBy)) {
    return {
      success: false,
      error: {
        type: 'ValidationError',
        message: 'Invalid sortBy parameter',
        statusCode: 400,
      },
    }
  }

  return {
    success: true,
    data: result as PaginationParams,
  }
}
