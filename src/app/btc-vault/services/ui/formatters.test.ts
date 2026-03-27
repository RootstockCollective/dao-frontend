import { describe, it, expect } from 'vitest'
import {
  formatApyPercent,
  formatPercent,
  formatTimestamp,
  formatDateShort,
  formatDateClosingOn,
  formatDateFullMonthPaddedDayUtc,
  shortenTxHash,
  formatCountdown,
} from './formatters'

describe('formatApyPercent', () => {
  it('formats 8.5% APY from decimal', () => {
    expect(formatApyPercent(0.085)).toBe('8.50')
  })
  it('formats 0% APY', () => {
    expect(formatApyPercent(0)).toBe('0.00')
  })
})

describe('formatPercent', () => {
  it('formats float to percentage string', () => {
    expect(formatPercent(10.2)).toBe('10.20%')
  })
  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00%')
  })
})

describe('shortenTxHash', () => {
  it('shortens a 66-char hex hash', () => {
    const hash = '0x' + 'a'.repeat(64)
    expect(shortenTxHash(hash)).toBe('0xaaaa...aaaa')
  })
  it('returns short strings unchanged', () => {
    expect(shortenTxHash('0xabc')).toBe('0xabc')
  })
})

describe('formatCountdown', () => {
  it('returns "Expired" for past timestamps', () => {
    expect(formatCountdown(0)).toBe('Expired')
  })
})

describe('formatTimestamp', () => {
  it('defaults to day-first date-only format', () => {
    const result = formatTimestamp(1700000000)
    expect(result).toContain('2023')
    expect(result).toMatch(/^\d{2} \w{3} \d{4}$/)
  })

  it('includes time when includeTime option is true', () => {
    const result = formatTimestamp(1700000000, { includeTime: true })
    expect(result).toContain('2023')
    expect(result).toMatch(/^\d{2} \w{3} \d{4}, \d{2}:\d{2} [AP]M$/)
  })
})

describe('formatDateShort', () => {
  it('formats unix timestamp to day-first date-only string (e.g. 21 May 2025)', () => {
    const result = formatDateShort(1747872000) // 21 May 2025 00:00:00 UTC
    expect(result).toContain('2025')
    expect(result).toMatch(/^\d{2} \w{3} \d{4}$/)
  })
  it('uses updated when present for lastUpdated display', () => {
    const created = 1700000000
    const updated = 1700086400
    expect(formatDateShort(created)).not.toBe(formatDateShort(updated))
  })
})

describe('formatDateClosingOn', () => {
  it('formats unix timestamp to month and day (e.g. February 23)', () => {
    // 23 Feb 2025 00:00:00 UTC
    const result = formatDateClosingOn(1740268800)
    expect(result).toBe('February 23')
  })
  it('formats March 19', () => {
    const result = formatDateClosingOn(1742342400) // 19 Mar 2025 00:00:00 UTC
    expect(result).toMatch(/March 19/)
  })
})

describe('formatDateFullMonthPaddedDayUtc', () => {
  it('formats with full month and zero-padded day (e.g. April 06)', () => {
    // 6 Apr 2026 00:00:00 UTC
    const result = formatDateFullMonthPaddedDayUtc(1775433600)
    expect(result).toBe('April 06')
  })
  it('pads single-digit days', () => {
    expect(formatDateFullMonthPaddedDayUtc(1775347200)).toBe('April 05') // 5 Apr 2026 UTC
  })
})
