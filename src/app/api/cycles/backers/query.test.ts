import { describe, expect, it } from 'vitest'

import {
  buildBackersPerCycleQuery,
  DEFAULT_CYCLE_LIMIT,
  MAX_CYCLE_LIMIT,
  parseCycleLimit,
} from './query'

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
    expect(sqlFor()).toContain(`LIMIT ${DEFAULT_CYCLE_LIMIT}`)
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

  it('carries Backers forward to later cycles rather than only counting in-cycle activity', () => {
    // The inequality join is what makes a Backer who stopped transacting still count.
    expect(sqlFor(10)).toContain('p.cycle_start <= c.cycle_start')
  })

  it('treats anything but an explicit decrease as an increase', () => {
    expect(sqlFor(10)).toContain('CASE WHEN "increased" = false THEN -1 ELSE 1 END')
  })

  it('counts only positive net allocations', () => {
    expect(sqlFor(10)).toContain('COUNT(*) FILTER (WHERE net > 0)')
  })
})

describe('parseCycleLimit', () => {
  it('falls back to the default for missing, non-numeric or non-positive values', () => {
    for (const raw of [null, '', 'abc', '0', '-5', '1.5']) {
      expect(parseCycleLimit(raw)).toBe(DEFAULT_CYCLE_LIMIT)
    }
  })

  it('passes through a valid limit', () => {
    expect(parseCycleLimit('25')).toBe(25)
  })

  it('caps an oversized limit', () => {
    expect(parseCycleLimit('99999')).toBe(MAX_CYCLE_LIMIT)
  })
})
