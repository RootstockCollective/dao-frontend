import { Duration } from 'luxon'

/** The countdown the app's banners share, e.g. the cycle banner: `3d 04h 12m`. */
const COUNTDOWN_FORMAT = "d'd' hh'h' mm'm'"

export const formatCountdown = (duration: Duration): string => duration.toFormat(COUNTDOWN_FORMAT)

/** Same countdown from a number of seconds, never negative. */
export const formatCountdownFromSeconds = (seconds: number): string =>
  formatCountdown(Duration.fromObject({ seconds: Math.max(0, Math.floor(seconds)) }))
