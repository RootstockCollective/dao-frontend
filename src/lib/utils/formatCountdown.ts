import { Duration } from 'luxon'

const COUNTDOWN_FORMAT = "d'd' hh'h' mm'm'"

export const formatCountdown = (duration: Duration): string => duration.toFormat(COUNTDOWN_FORMAT)

export const formatCountdownFromSeconds = (seconds: number): string =>
  formatCountdown(Duration.fromObject({ seconds: Math.max(0, Math.floor(seconds)) }))
