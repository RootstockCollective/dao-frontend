import { describe, it, expect } from 'vitest'
import { formatApyPercent, shortenTxHash, formatCountdown } from './formatters'

describe('formatApyPercent', () => {
  it('formats 8.5% APY from decimal', () => {
    expect(formatApyPercent(0.085)).toBe('8.50')
  })
  it('formats 0% APY', () => {
    expect(formatApyPercent(0)).toBe('0.00')
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
