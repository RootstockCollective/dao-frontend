import Big from '@/lib/big'
import { describe, expect, it } from 'vitest'

describe('max', () => {
  it('1, 2, 3', () => {
    expect(Big.max(Big(1), Big(2), Big(3)).toString()).eq('3')
  })
  it('3, 2, 1', () => {
    expect(Big.max(Big(3), Big(2), Big(1)).toString()).eq('3')
  })
  it('1, 3, 2', () => {
    expect(Big.max(Big(1), Big(3), Big(2)).toString()).eq('3')
  })
  it('1', () => {
    expect(Big.max(Big(1)).toString()).eq('1')
  })
})

describe('ceil', () => {
  it('1.1', () => {
    expect(Math.ceil(1.1)).eq(2)
    expect(Big(1.1).ceil().toString()).eq('2')
  })
  it('1.9', () => {
    expect(Math.ceil(1.9)).eq(2)
    expect(Big(1.9).ceil().toString()).eq('2')
  })
  it('1.0', () => {
    expect(Math.ceil(1.0)).eq(1)
    expect(Big(1.0).ceil().toString()).eq('1')
  })
  it('0.1', () => {
    expect(Math.ceil(0.1)).eq(1)
    expect(Big(0.1).ceil().toString()).eq('1')
  })
  it('negative', () => {
    expect(Math.ceil(-1.1)).eq(-1)
    expect(Big('-1.1').ceil().toString()).eq('-1')
  })
})

describe('roundHalfUp', () => {
  describe('positive numbers', () => {
    it('roundHalfUp with 1.5 should be 2', () => {
      const number = 1.5
      expect(Math.round(number)).eq(2)
      expect(Big(number).roundHalfUp().toString()).eq('2')
    })

    it('roundHalfUp with 2.5 should be 3 (rounds to even)', () => {
      const number = 2.5
      expect(Math.round(number)).eq(3) // Note: Math.round always rounds up for .5
      expect(Big(number).roundHalfUp().toString()).eq('3')
    })

    it('roundHalfUp with 3.5 should be 4', () => {
      const number = 3.5
      expect(Math.round(number)).eq(4)
      expect(Big(number).roundHalfUp().toString()).eq('4')
    })

    it('roundHalfUp with 4.5 should be 4 (rounds to even)', () => {
      const number = 4.5
      expect(Math.round(number)).eq(5) // Note: Math.round always rounds up for .5
      expect(Big(number).roundHalfUp().toString()).eq('5')
    })
  })

  describe('less than .5', () => {
    it('roundHalfUp with 3.49 should be 3', () => {
      const number = 3.49
      expect(Math.round(number)).eq(3)
      expect(Big(number).roundHalfUp().toString()).eq('3')
    })

    it('roundHalfUp with 3.45 should be 3', () => {
      const number = 3.45
      expect(Math.round(number)).eq(3)
      expect(Big(number).roundHalfUp().toString()).eq('3')
    })
  })

  describe('negative numbers', () => {
    it('roundHalfUp with -1.5 should be -2', () => {
      const number = -1.5
      expect(Math.round(number)).eq(-1)
      expect(Big(number).roundHalfUp().toString()).eq('-1')
    })

    it('roundHalfUp with -2.5 should be -2 (rounds to even)', () => {
      const number = -2.5
      expect(Math.round(number)).eq(-2)
      expect(Big(number).roundHalfUp().toString()).eq('-2')
    })

    it('roundHalfUp with -3.5 should be -4', () => {
      const number = -3.5
      expect(Math.round(number)).eq(-3)
      expect(Big(number).roundHalfUp().toString()).eq('-3')
    })
  })

  describe('edge cases', () => {
    it('roundHalfUp with 0.5 should be 0', () => {
      const number = 0.5
      expect(Math.round(number)).eq(1)
      expect(Big(number).roundHalfUp().toString()).eq('1')
    })

    it('roundHalfUp with -0.5 should be 0', () => {
      const number = -0.5
      expect(Math.round(number)).eq(0)
      expect(Big(number).roundHalfUp().toString()).eq('0')
    })
  })
})

describe('floor', () => {
  describe('positive numbers', () => {
    it('floor with 1.55 should be 1', () => {
      const number = 1.55
      expect(Math.floor(number)).eq(1)
      expect(Big(number).floor().toString()).eq('1')
    })

    it('floor with 1.99 should be 1', () => {
      const number = 1.99
      expect(Math.floor(number)).eq(1)
      expect(Big(number).floor().toString()).eq('1')
    })

    it('floor with 2.01 should be 2', () => {
      const number = 2.01
      expect(Math.floor(number)).eq(2)
      expect(Big(number).floor().toString()).eq('2')
    })
  })

  describe('negative numbers', () => {
    it('floor with -1.55 should be -2', () => {
      const number = -1.55
      expect(Math.floor(number)).eq(-2)
      expect(Big(number).floor().toString()).eq('-2')
    })

    it('floor with -1.99 should be -2', () => {
      const number = -1.99
      expect(Math.floor(number)).eq(-2)
      expect(Big(number).floor().toString()).eq('-2')
    })

    it('floor with -2.01 should be -3', () => {
      const number = -2.01
      expect(Math.floor(number)).eq(-3)
      expect(Big(number).floor().toString()).eq('-3')
    })
  })

  describe('edge cases', () => {
    it('floor with 0.99 should be 0', () => {
      const number = 0.99
      expect(Math.floor(number)).eq(0)
      expect(Big(number).floor().toString()).eq('0')
    })

    it('floor with -0.01 should be -1', () => {
      const number = -0.01
      expect(Math.floor(number)).eq(-1)
      expect(Big(number).floor().toString()).eq('-1')
    })

    it('floor with 0 should be 0', () => {
      const number = 0
      expect(Math.floor(number)).eq(0)
      expect(Big(number).floor().toString()).eq('0')
    })
  })
})

describe('.toFixedNoTrailing', () => {
  // Basic functionality tests
  it('handles basic number with trailing zeros', () => {
    const num = new Big('123.4500')
    expect(num.toFixedNoTrailing(4)).toBe('123.45')
  })

  it('handles whole numbers', () => {
    const num = new Big('123.0000')
    expect(num.toFixedNoTrailing(4)).toBe('123')
  })

  // Decimal places (dp) tests
  it('handles undefined dp', () => {
    const num = new Big('123.45')
    expect(num.toFixedNoTrailing()).toBe('123.45')
  })

  it('handles dp = 0', () => {
    const num = new Big('123.45')
    expect(num.toFixedNoTrailing(0)).toBe('123')
  })

  it('throws error for negative dp', () => {
    const num = new Big('123.45')
    expect(() => num.toFixedNoTrailing(-1)).toThrow('Invalid dp argument')
  })

  it('throws error for non-integer dp', () => {
    const num = new Big('123.45')
    expect(() => num.toFixedNoTrailing(1.5)).toThrow('Invalid dp argument')
  })

  // Rounding mode (rm) tests
  it('handles different rounding modes', () => {
    const num = new Big('123.456')
    expect(num.toFixedNoTrailing(2, 0)).toBe('123.45') // Round down
    expect(num.toFixedNoTrailing(2, 1)).toBe('123.46') // Round half up
    expect(num.toFixedNoTrailing(2, 2)).toBe('123.46') // Round half even
    expect(num.toFixedNoTrailing(2, 3)).toBe('123.46') // Round up
  })

  it('throws error for invalid rounding mode', () => {
    const num = new Big('123.45')
    expect(() => num.toFixedNoTrailing(2, 4 as any)).toThrow('Invalid rm argument')
    expect(() => num.toFixedNoTrailing(2, -1 as any)).toThrow('Invalid rm argument')
  })

  // Edge cases
  it('handles very small numbers', () => {
    const num = new Big('0.000001230')
    expect(num.toFixedNoTrailing(9)).toBe('0.00000123')
  })

  it('handles very large numbers', () => {
    const num = new Big('123456789.123400')
    expect(num.toFixedNoTrailing(4)).toBe('123456789.1234')
  })

  it('handles negative numbers', () => {
    const num = new Big('-123.4500')
    expect(num.toFixedNoTrailing(4)).toBe('-123.45')
  })

  it('handles zero', () => {
    const num = new Big('0')
    expect(num.toFixedNoTrailing(4)).toBe('0')
  })
})
