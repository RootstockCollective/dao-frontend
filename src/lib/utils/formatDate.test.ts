import { describe, expect, it } from 'vitest'

import {
  formatDateDayFirst,
  formatDateDayFirstWithTime,
  formatDateExpanded,
  formatDateForCsv,
  formatDateFullMonth,
  formatDateFullMonthPadded,
  formatDateMonthFirst,
  formatDateRange,
  formatMonthYear,
  formatPeriodToMonthYear,
} from './formatDate'

// 14 Nov 2023 21:33:20 UTC → 1700000000
const TS = 1700000000

describe('formatDateDayFirst', () => {
  it('formats as "dd MMM yyyy"', () => {
    const result = formatDateDayFirst(TS)
    expect(result).toContain('2023')
    expect(result).toMatch(/^\d{2} \w{3} \d{4}$/)
  })

  it('accepts string input', () => {
    expect(formatDateDayFirst(String(TS))).toBe(formatDateDayFirst(TS))
  })
})

describe('formatDateDayFirstWithTime', () => {
  it('formats as "dd MMM yyyy, hh:mm a"', () => {
    const result = formatDateDayFirstWithTime(TS)
    expect(result).toContain('2023')
    expect(result).toMatch(/^\d{2} \w{3} \d{4}, \d{2}:\d{2} [AP]M$/)
  })
})

describe('formatDateMonthFirst', () => {
  it('formats as "MMM d, yyyy"', () => {
    const result = formatDateMonthFirst(TS)
    expect(result).toContain('2023')
    expect(result).toMatch(/^\w{3} \d{1,2}, \d{4}$/)
  })
})

describe('formatDateFullMonth', () => {
  it('formats as "MMMM d" in UTC', () => {
    // 23 Feb 2025 00:00:00 UTC
    expect(formatDateFullMonth(1740268800, { utc: true })).toBe('February 23')
  })

  it('formats March 19 in UTC', () => {
    expect(formatDateFullMonth(1742342400, { utc: true })).toMatch(/March 19/)
  })
})

describe('formatDateFullMonthPadded', () => {
  it('formats with zero-padded day in UTC', () => {
    // 6 Apr 2026 00:00:00 UTC
    expect(formatDateFullMonthPadded(1775433600, { utc: true })).toBe('April 06')
  })

  it('pads single-digit days', () => {
    // 5 Apr 2026 00:00:00 UTC
    expect(formatDateFullMonthPadded(1775347200, { utc: true })).toBe('April 05')
  })
})

describe('formatMonthYear', () => {
  it('formats as "MMMM yyyy"', () => {
    expect(formatMonthYear(TS)).toMatch(/^\w+ \d{4}$/)
    expect(formatMonthYear(TS)).toContain('2023')
  })

  it('accepts string input', () => {
    expect(formatMonthYear(String(TS))).toBe(formatMonthYear(TS))
  })
})

describe('formatPeriodToMonthYear', () => {
  it('converts "YYYY-MM" to "MMMM yyyy"', () => {
    expect(formatPeriodToMonthYear('2025-03')).toBe('March 2025')
    expect(formatPeriodToMonthYear('2024-12')).toBe('December 2024')
    expect(formatPeriodToMonthYear('2025-01')).toBe('January 2025')
  })
})

describe('formatDateExpanded', () => {
  it('formats as "MMM d, HH:mm"', () => {
    const result = formatDateExpanded(TS)
    expect(result).toMatch(/^\w{3} \d{1,2}, \d{2}:\d{2}$/)
  })

  it('accepts string input', () => {
    expect(formatDateExpanded(String(TS))).toBe(formatDateExpanded(TS))
  })
})

describe('formatDateForCsv', () => {
  it('defaults to 12h format', () => {
    const result = formatDateForCsv(TS)
    expect(result).toMatch(/[AP]M$/)
  })

  it('supports 24h UTC format', () => {
    const result = formatDateForCsv(TS, { utc: true, hour12: false })
    expect(result).not.toMatch(/[AP]M/)
    expect(result).toContain('2023')
  })
})

describe('formatDateRange', () => {
  it('formats same-month range', () => {
    // Jan 2 2024 12:00 UTC + 14 days (midday to avoid timezone edge cases)
    const start = 1704196800
    const duration = 14 * 86400
    const result = formatDateRange(start, duration)
    expect(result).toMatch(/Jan \d+ - \d+, 2024/)
  })

  it('formats single-day range', () => {
    // Jan 2 2024 12:00 UTC
    const start = 1704196800
    const result = formatDateRange(start, 1)
    expect(result).toMatch(/Jan \d+, 2024/)
  })

  it('accepts string input', () => {
    const start = '1704196800'
    const result = formatDateRange(start, 14 * 86400)
    expect(result).toMatch(/Jan/)
  })
})
