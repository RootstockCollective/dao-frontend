import { CYCLE_HISTORY_LIMIT } from '@/lib/constants'
import { db } from '@/lib/db'

export interface BackersPerCycleRow {
  /** Cycle start as unix seconds, matching `Cycle.currentCycleStart`. */
  cycleStart: string
  backersCount: number
}

/**
 * Backers holding a positive allocation at the close of each of the last `CYCLE_HISTORY_LIMIT` cycles.
 *
 * `AllocationHistory` records changes, not balances, so each Backer's balance is accumulated
 * with a window function and turned into half-open intervals; a Backer then matches at most
 * one interval per cycle, keeping the join at cycles × Backers rather than cycles × rows.
 * Sign convention mirrors the tx-history route: only an explicit `increased = false` is a
 * withdrawal.
 */
export const buildBackersPerCycleQuery = () =>
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
      -- net > 0 belongs here, not in \`held\`: filtering before LEAD would stretch an interval
      -- across the cycles where the Backer held nothing.
      ON h.net > 0
     AND h.from_cycle <= c.cycle_start
     AND (h.to_cycle IS NULL OR h.to_cycle > c.cycle_start)
    GROUP BY c.cycle_start
    ORDER BY c.cycle_start DESC
  `,
    [CYCLE_HISTORY_LIMIT],
  )
