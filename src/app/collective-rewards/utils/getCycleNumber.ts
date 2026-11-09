import { FIRST_CYCLE_START_SECONDS } from '../constants/chartConstants'

/** The one derivation shared by the rewards dashboard and the tx-history tables. */
export const getCycleNumber = (cycleStartSeconds: number, cycleDurationSeconds: number): number =>
  Math.floor((cycleStartSeconds - FIRST_CYCLE_START_SECONDS) / cycleDurationSeconds) + 1
