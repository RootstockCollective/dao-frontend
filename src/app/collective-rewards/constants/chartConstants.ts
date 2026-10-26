import { ONE_DAY_IN_MS } from '@/lib/constants'

export { ONE_DAY_IN_MS }

export const ONE_DAY_IN_SECONDS = 24 * 60 * 60

export const FIRST_CYCLE_START_DATE_ISO = '2024-10-30T00:00:00Z'
export const FIRST_CYCLE_START_SECONDS = new Date(FIRST_CYCLE_START_DATE_ISO).getTime() / 1000
