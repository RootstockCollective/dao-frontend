import { describe, it, expect } from 'vitest'
import {
  formatApyPercent,
  formatPercent,
  formatTimestamp,
  formatDateShort,
  shortenTxHash,
  formatCountdown,
} from './formatters'

describe('formatApyPercent', () => {
  it('formats 8.5% APY from basis points', () => {
    expect(formatApyPercent(85_000_000n)).toBe('8.50')
  })
  it('formats 0% APY', () => {
    expect(formatApyPercent(0n)).toBe('0.00')
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
  it('formats a unix timestamp to readable date', () => {
    const result = formatTimestamp(1700000000)
    // Just verify it returns a non-empty string (locale-dependent exact format)
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain('2023')
  })
})

describe('formatDateShort', () => {
  it('formats unix timestamp to date-only string (e.g. 21 May 2025)', () => {
    const result = formatDateShort(1747872000) // 21 May 2025 00:00:00 UTC
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain('2025')
    expect(result).toMatch(/\d+/)
  })
  it('uses updated when present for lastUpdated display', () => {
    const created = 1700000000
    const updated = 1700086400
    expect(formatDateShort(created)).not.toBe(formatDateShort(updated))
  })
})
