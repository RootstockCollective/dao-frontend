import { db } from '@/lib/db'

export const DEFAULT_CYCLE_LIMIT = 50
export const MAX_CYCLE_LIMIT = 200

export interface BackersPerCycleRow {
  /** Cycle start as a unix timestamp in seconds, matching `Cycle.currentCycleStart`. */
  cycleStart: string
  backersCount: number
}

/**
 * Counts, for each of the most recent `limit` cycles, the Backers holding a positive
 * allocation when that cycle closed.
 *
 * `AllocationHistory` records allocation *changes*, not balances, so a running total is the
 * only way to answer this: a Backer who allocated in cycle 30 and never touched it again has
 * no rows after cycle 30 but is still backing in cycle 46. The join carries every Backer
 * forward to all later cycles and re-sums their deltas, rather than only counting Backers
 * who happened to transact within the cycle.
 *
 * The sign convention mirrors the tx-history route: anything other than an explicit
 * `increased = false` counts as an increase, so a null never silently flips to a withdrawal.
 */
export const buildBackersPerCycleQuery = (limit: number = DEFAULT_CYCLE_LIMIT) =>
  db.raw(
    `
    WITH cycles AS (
      SELECT DISTINCT "currentCycleStart"::numeric AS cycle_start
      FROM "Cycle"
      ORDER BY 1 DESC
      LIMIT ?
    ),
    per_cycle AS (
      SELECT
        "backer",
        "cycleStart"::numeric AS cycle_start,
        SUM((CASE WHEN "increased" = false THEN -1 ELSE 1 END) * "allocation"::numeric) AS delta
      FROM "AllocationHistory"
      GROUP BY "backer", "cycleStart"
    ),
    running AS (
      SELECT
        c.cycle_start,
        p."backer",
        SUM(p.delta) AS net
      FROM cycles c
      JOIN per_cycle p ON p.cycle_start <= c.cycle_start
      GROUP BY c.cycle_start, p."backer"
    )
    SELECT
      cycle_start::text AS "cycleStart",
      COUNT(*) FILTER (WHERE net > 0)::int AS "backersCount"
    FROM running
    GROUP BY cycle_start
    ORDER BY cycle_start DESC
  `,
    [limit],
  )

/** Clamps a `limit` query param into the supported range. */
export const parseCycleLimit = (raw: string | null): number => {
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_CYCLE_LIMIT
  return Math.min(parsed, MAX_CYCLE_LIMIT)
}
