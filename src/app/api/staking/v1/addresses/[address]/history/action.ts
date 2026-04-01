/**
 * Staking history database access used by the CSV export route.
 * Implementation lives under `sources/database/fetch-from-database.ts`.
 *
 * @example Re-exported functions accept the same payloads as in `fetch-from-database.ts` (see `@example` there).
 */
export { getStakingHistoryCountFromDB, getStakingHistoryFromDB } from './sources/database/fetch-from-database'
