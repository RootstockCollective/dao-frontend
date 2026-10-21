import { describe, expect, it } from 'vitest'

import { CYCLE_HISTORY_LIMIT } from '@/lib/constants'

import { buildBackersPerCycleQuery } from './query'

// knex builds the SQL without a connection: these cover the query's shape, not its results.
describe('buildBackersPerCycleQuery', () => {
  const sqlFor = () => buildBackersPerCycleQuery().toString()

  it('binds the shared cycle limit', () => {
    expect(sqlFor()).toContain(`LIMIT ${CYCLE_HISTORY_LIMIT}`)
  })

  it('quotes every camelCase identifier so Postgres does not fold them to lowercase', () => {
    const sql = sqlFor()

    for (const identifier of [
      '"currentCycleStart"',
      '"Cycle"',
      '"AllocationHistory"',
      '"cycleStart"',
      '"allocation"',
      '"increased"',
      '"backer"',
    ]) {
      expect(sql).toContain(identifier)
    }
  })

  it('carries Backers forward with a running window rather than an inequality join', () => {
    expect(sqlFor()).toContain('SUM(delta) OVER (PARTITION BY "backer" ORDER BY cycle_start)')
  })

  it('turns each running balance into a half-open interval', () => {
    const sql = sqlFor()

    expect(sql).toContain('LEAD(cycle_start) OVER (PARTITION BY "backer" ORDER BY cycle_start)')
    expect(sql).toContain('h.to_cycle IS NULL OR h.to_cycle > c.cycle_start')
  })

  it('filters non-positive balances in the join, not before LEAD', () => {
    const sql = sqlFor()

    expect(sql).toContain('ON h.net > 0')
    expect(sql).not.toMatch(/FROM running\s+WHERE net > 0/)
  })

  it('keeps cycles with no Backers instead of dropping them from the result', () => {
    expect(sqlFor()).toContain('LEFT JOIN held h')
  })

  it('treats anything but an explicit decrease as an increase', () => {
    expect(sqlFor()).toContain('CASE WHEN "increased" = false THEN -1 ELSE 1 END')
  })
})
