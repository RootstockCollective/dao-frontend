import { FIRST_CYCLE_START_DATE_ISO } from '@/app/collective-rewards/components/CycleMetrics/CycleNumber'

export const ONE_DAY_IN_SECONDS = 24 * 60 * 60
export const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24
export const FIVE_MONTHS_IN_MS = 5 * 30 * 24 * 60 * 60 * 1000

export const CHART_BUFFER_PERCENTAGE = 1.1
export const REWARDS_DOMAIN_BUFFER = 3
export const X_DOMAIN_BUFFER = 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds

export const DEFAULT_CHART_HEIGHT = 420

export const ISO_DATE_LENGTH = 10

export const FIRST_CYCLE_START_SECONDS = new Date(FIRST_CYCLE_START_DATE_ISO).getTime() / 1000
