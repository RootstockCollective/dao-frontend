import { describe, it, expect } from 'vitest'
import { bigIntToBuffer } from './proposalId'

describe('bigIntToBuffer', () => {
  it('converts proposal ID to 32-byte buffer', () => {
    const buf = bigIntToBuffer('1')
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBe(32)
    expect(buf.toString('hex')).toBe('0000000000000000000000000000000000000000000000000000000000000001')
  })

  it('pads small values to 64 hex chars', () => {
    const buf = bigIntToBuffer('42')
    expect(buf.length).toBe(32)
    expect(buf.toString('hex')).toMatch(/^0+2a$/)
  })

  it('handles large proposal IDs', () => {
    const buf = bigIntToBuffer('12345678901234567890')
    expect(buf.length).toBe(32)
    expect(BigInt('0x' + buf.toString('hex'))).toBe(12345678901234567890n)
  })
})
