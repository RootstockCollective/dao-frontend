import { MAX_PAGE_SIZE } from '@/lib/constants'
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
  SORT_DIRECTION_ASC,
  SORT_DIRECTION_DESC,
  PAGE_PARAM_NAME,
  PAGE_SIZE_PARAM_NAME,
  SORT_DIRECTION_PARAM_NAME,
  SORT_BY_PARAM_NAME,
} from './constants'

type ValidationError = {
  type: 'ValidationError'
  message: string
  statusCode: number
}

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
    name: PAGE_PARAM_NAME,
    parse: v => parseInt(v ?? DEFAULT_PAGE_NUMBER, 10),
    validate: v => !isNaN(v) && v >= 1,
    errorMessage: 'Invalid page parameter',
  },
  pageSize: {
    name: PAGE_SIZE_PARAM_NAME,
    parse: v => parseInt(v ?? DEFAULT_PAGE_SIZE, 10),
    validate: v => !isNaN(v) && v >= 1 && v <= MAX_PAGE_SIZE,
    errorMessage: 'Invalid pageSize parameter',
  },
  sortDirection: {
    name: SORT_DIRECTION_PARAM_NAME,
    parse: v => v ?? DEFAULT_SORT_DIRECTION,
    validate: v => SORT_DIRECTIONS.includes(v),
    errorMessage: 'Invalid sortDirection parameter',
  },
  sortBy: {
    name: SORT_BY_PARAM_NAME,
    parse: v => v ?? undefined,
    // sortBy validation is handled separately
  },
}

export function parsePaginationParams(url: string, allowedColumns?: string[]): PaginationResult {
  const { searchParams } = new URL(url)
  const parsedParams: Partial<PaginationParams> = {}

  for (const [key, config] of Object.entries(paramConfigs)) {
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

    parsedParams[key as ParamKey] = parsed
  }

  // Extra validation for sortBy
  if (parsedParams.sortBy && !allowedColumns?.includes(parsedParams.sortBy)) {
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
    data: parsedParams as PaginationParams,
  }
}
