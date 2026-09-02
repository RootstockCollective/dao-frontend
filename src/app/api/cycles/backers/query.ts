import { CYCLE_HISTORY_LIMIT } from '@/lib/constants'
import { db } from '@/lib/db'

/**
 * Ceiling for the `limit` param. The dashboard asks for `CYCLE_HISTORY_LIMIT`, which is also
 * the default; this only bounds what an arbitrary caller can request.
 */
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
 * no rows after cycle 30 but is still backing in cycle 46.
 *
 * That carry-forward is done with a window function rather than by joining every earlier
 * allocation row to every later cycle. `running` accumulates each Backer's balance in one
 * ordered pass, and `held` turns those steps into half-open intervals, so a Backer matches
 * *at most one* interval per cycle. The join is then bounded by cycles × Backers instead of
 * cycles × allocation-rows, which is what made the previous shape degrade as history grew.
 *
 * The sign convention mirrors the tx-history route: anything other than an explicit
 * `increased = false` counts as an increase, so a null never silently flips to a withdrawal.
 */
export const buildBackersPerCycleQuery = (limit: number = CYCLE_HISTORY_LIMIT) =>
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
        "backer",
        cycle_start,
        SUM(delta) OVER (PARTITION BY "backer" ORDER BY cycle_start) AS net
      FROM per_cycle
    ),
    held AS (
      SELECT
        "backer",
        net,
        cycle_start AS from_cycle,
        LEAD(cycle_start) OVER (PARTITION BY "backer" ORDER BY cycle_start) AS to_cycle
      FROM running
    )
    SELECT
      c.cycle_start::text AS "cycleStart",
      COUNT(h."backer")::int AS "backersCount"
    FROM cycles c
    LEFT JOIN held h
      -- Filtered in the join rather than in \`held\`: dropping the non-positive rows before
      -- LEAD would stretch a Backer's interval across the cycles where they held nothing.
      ON h.net > 0
     AND h.from_cycle <= c.cycle_start
     AND (h.to_cycle IS NULL OR h.to_cycle > c.cycle_start)
    GROUP BY c.cycle_start
    ORDER BY c.cycle_start DESC
  `,
    [limit],
  )

/**
 * Clamps a `limit` query param into the supported range.
 *
 * Decimal digits only: `Number()` alone would accept `0x20`, `1e3` and padded input, which
 * silently turn into a limit the caller never asked for.
 */
export const parseCycleLimit = (raw: string | null): number => {
  if (raw === null || !/^\d+$/.test(raw)) return CYCLE_HISTORY_LIMIT

  const parsed = Number(raw)
  if (parsed < 1) return CYCLE_HISTORY_LIMIT

  return Math.min(parsed, MAX_CYCLE_LIMIT)
}
