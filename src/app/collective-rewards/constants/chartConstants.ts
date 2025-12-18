export const ONE_DAY_IN_SECONDS = 24 * 60 * 60
export const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24

export const FOUR_MONTHS_IN_MS = 4 * 30 * 24 * 60 * 60 * 1000
export const FIVE_MONTHS_IN_MS = 5 * 30 * 24 * 60 * 60 * 1000

export const CHART_BUFFER_PERCENTAGE = 1.1
export const REWARDS_DOMAIN_BUFFER = 3
export const X_DOMAIN_BUFFER = 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds

export const DEFAULT_CHART_HEIGHT = 420

export const FIRST_CYCLE_START_DATE_ISO = '2024-10-30T00:00:00Z'
export const FIRST_CYCLE_START_SECONDS = new Date(FIRST_CYCLE_START_DATE_ISO).getTime() / 1000
