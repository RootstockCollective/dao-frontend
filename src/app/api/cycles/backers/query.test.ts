import { describe, expect, it } from 'vitest'

import { CYCLE_HISTORY_LIMIT } from '@/lib/constants'

import { buildBackersPerCycleQuery, MAX_CYCLE_LIMIT, parseCycleLimit } from './query'

/**
 * knex builds SQL without touching a connection, so these assertions cover the query's shape
 * without a database. They can't prove it returns the right numbers — that still needs one
 * run against a populated indexer — but they do catch the mistakes that break it silently:
 * a dropped quote on a camelCase identifier, or the limit binding going missing.
 */
describe('buildBackersPerCycleQuery', () => {
  const sqlFor = (limit?: number) => buildBackersPerCycleQuery(limit).toString()

  it('binds the cycle limit', () => {
    expect(sqlFor(12)).toContain('LIMIT 12')
  })

  it('defaults the limit when none is given', () => {
    expect(sqlFor()).toContain(`LIMIT ${CYCLE_HISTORY_LIMIT}`)
  })

  it('quotes every camelCase identifier so Postgres does not fold them to lowercase', () => {
    const sql = sqlFor(10)

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
    // The window is what makes a Backer who stopped transacting still count, without
    // re-joining every earlier allocation row to every later cycle.
    expect(sqlFor(10)).toContain('SUM(delta) OVER (PARTITION BY "backer" ORDER BY cycle_start)')
  })

  it('turns each running balance into a half-open interval', () => {
    const sql = sqlFor(10)

    expect(sql).toContain('LEAD(cycle_start) OVER (PARTITION BY "backer" ORDER BY cycle_start)')
    expect(sql).toContain('h.to_cycle IS NULL OR h.to_cycle > c.cycle_start')
  })

  it('filters non-positive balances in the join, not before LEAD', () => {
    // Dropping them inside `held` would stretch a Backer's interval across the cycles where
    // they held nothing, counting them in cycles they had withdrawn from.
    const sql = sqlFor(10)

    expect(sql).toContain('ON h.net > 0')
    expect(sql).not.toMatch(/FROM running\s+WHERE net > 0/)
  })

  it('keeps cycles with no Backers instead of dropping them from the result', () => {
    expect(sqlFor(10)).toContain('LEFT JOIN held h')
  })

  it('treats anything but an explicit decrease as an increase', () => {
    expect(sqlFor(10)).toContain('CASE WHEN "increased" = false THEN -1 ELSE 1 END')
  })
})

describe('parseCycleLimit', () => {
  it('falls back to the default for missing, non-numeric or non-positive values', () => {
    for (const raw of [null, '', 'abc', '0', '-5', '1.5']) {
      expect(parseCycleLimit(raw)).toBe(CYCLE_HISTORY_LIMIT)
    }
  })

  it('rejects anything that is not plain decimal digits', () => {
    // `Number()` would read these as 32, 1000 and 12 respectively.
    for (const raw of ['0x20', '1e3', ' 12 ', '+12', '12abc']) {
      expect(parseCycleLimit(raw)).toBe(CYCLE_HISTORY_LIMIT)
    }
  })

  it('passes through a valid limit', () => {
    expect(parseCycleLimit('25')).toBe(25)
  })

  it('caps an oversized limit', () => {
    expect(parseCycleLimit('99999')).toBe(MAX_CYCLE_LIMIT)
  })
})
