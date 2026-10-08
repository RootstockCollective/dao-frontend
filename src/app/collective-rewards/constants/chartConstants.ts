import { ONE_DAY_IN_MS } from '@/lib/constants'

export { ONE_DAY_IN_MS }

export const ONE_DAY_IN_SECONDS = 24 * 60 * 60

export const FOUR_MONTHS_IN_MS = 4 * 30 * ONE_DAY_IN_MS
export const FIVE_MONTHS_IN_MS = 5 * 30 * ONE_DAY_IN_MS

export const CHART_BUFFER_PERCENTAGE = 1.1
export const REWARDS_DOMAIN_BUFFER = 3
export const X_DOMAIN_BUFFER = 10 * ONE_DAY_IN_MS

export const DEFAULT_CHART_HEIGHT = 420

export const FIRST_CYCLE_START_DATE_ISO = '2024-10-30T00:00:00Z'
export const FIRST_CYCLE_START_SECONDS = new Date(FIRST_CYCLE_START_DATE_ISO).getTime() / 1000
