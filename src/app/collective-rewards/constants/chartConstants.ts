export const WEI_DIVISOR = 10 ** 18

export const ONE_DAY_IN_SECONDS = 24 * 60 * 60
export const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24
export const FIVE_MONTHS_IN_MS = 5 * 30 * 24 * 60 * 60 * 1000

export const CHART_BUFFER_PERCENTAGE = 1.1

export const REWARDS_DOMAIN_BUFFER = 3

export const DEFAULT_CHART_HEIGHT = 420

export const ISO_DATE_LENGTH = 10

export const X_DOMAIN_BUFFER = 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds

export const CYCLE_DURATION_DAYS = 14
export const CYCLE_DURATION_SECONDS = CYCLE_DURATION_DAYS * ONE_DAY_IN_SECONDS
export const CYCLE_DURATION_MS = CYCLE_DURATION_DAYS * ONE_DAY_IN_MS

export const FIRST_CYCLE_START_MS = new Date('2024-10-30T00:00:00Z').getTime()
export const FIRST_CYCLE_START_SECONDS = FIRST_CYCLE_START_MS / 1000
