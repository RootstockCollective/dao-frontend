import { describe, it, expect } from 'vitest'
import {
  formatRbtc,
  formatApyPercent,
  formatPercent,
  formatTimestamp,
  shortenTxHash,
  formatCountdown,
} from './formatters'

describe('formatRbtc', () => {
  it('formats 0n as "0"', () => {
    expect(formatRbtc(0n)).toBe('0')
  })
  it('formats 1 BTC in Wei', () => {
    expect(formatRbtc(10n ** 18n)).toBe('1')
  })
  it('formats fractional BTC', () => {
    expect(formatRbtc(1_020_000_000_000_000_000n)).toBe('1.02')
  })
})

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
