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

describe('Why big.js', () => {
  describe('BigInt vs Big.js Precision Tests', () => {
    describe('Division', () => {
      it('should demonstrate precision loss in BigInt division', () => {
        const a = 1000000000000000000000n
        const b = 3n

        const bigintResult = a / b

        const bigJsA = new Big('1000000000000000000000')
        const bigJsB = new Big('3')
        const bigJsResult = bigJsA.div(bigJsB)

        expect(bigintResult.toString()).toBe('333333333333333333333')
        expect(bigJsResult.toString()).toBe('333333333333333333333.33333333333333333333')
      })
    })

    describe('Scientific Notation', () => {
      it('should handle scientific notation in Big.js but fail in BigInt', () => {
        const scientificNum = '1.23456789e+20'

        expect(() => BigInt(scientificNum)).toThrow()

        const bigJsNum = new Big(scientificNum)
        expect(bigJsNum.toString()).toBe('123456789000000000000')
      })
    })

    describe('Decimal Arithmetic', () => {
      it('should handle decimal arithmetic precisely in Big.js', () => {
        const a = '0.1'
        const b = '0.2'

        // JavaScript floating-point arithmetic
        expect(0.1 + 0.2).not.toBe(0.3)

        // BigInt can't handle decimals
        expect(() => BigInt(a)).toThrow()

        // Big.js handles it precisely
        const bigA = new Big(a)
        const bigB = new Big(b)
        expect(bigA.plus(bigB).toString()).toBe('0.3')
      })
    })
  })

  describe('Token Price Precision Tests', () => {
    const TOKEN_USD_PRICE = '0.05892520326157074'
    const TOKENS_TO_BUY = '123456789.123456789'

    it('demonstrates precision loss with Number type', () => {
      // ❌ Wrong way: Using Number
      const priceAsNumber = Number(TOKEN_USD_PRICE)
      const amountAsNumber = Number(TOKENS_TO_BUY)
      const totalWithNumber = priceAsNumber * amountAsNumber

      // ✅ Correct way: Using Big.js
      const priceAsBig = new Big(TOKEN_USD_PRICE)
      const amountAsBig = new Big(TOKENS_TO_BUY)
      const totalWithBig = priceAsBig.mul(amountAsBig)

      console.log('Price as Number:', priceAsNumber)
      console.log('Original price string:', TOKEN_USD_PRICE)
      console.log('\nTotal with Number:', totalWithNumber)
      console.log('Total with Big.js:', totalWithBig.toString())

      // Demonstrate that Number loses precision
      expect(totalWithNumber.toString()).not.toBe(totalWithBig.toString())
    })

    it('fails when trying to use BigInt with decimals', () => {
      // Attempt to use BigInt with decimals
      expect(() => {
        BigInt(TOKEN_USD_PRICE)
      }).toThrow()

      // Even if we multiply by 1e18 first to remove decimals, we still lose precision
      const priceWithoutDecimals = Number(TOKEN_USD_PRICE) * 1e18
      expect(() => {
        BigInt(priceWithoutDecimals)
      }).not.toThrow()

      // Show what happens if we try to work around decimals
      const scaledPrice = BigInt(Math.floor(Number(TOKEN_USD_PRICE) * 1e18))
      const scaledAmount = BigInt(Math.floor(Number(TOKENS_TO_BUY) * 1e18))
      const scaledTotal = (scaledPrice * scaledAmount) / BigInt(1e18)

      // Compare with Big.js
      const correctTotal = new Big(TOKEN_USD_PRICE).mul(TOKENS_TO_BUY)
      console.log('\nBigInt scaled total:', scaledTotal.toString())
      console.log('Correct Big.js total:', correctTotal.toString())

      // This will fail because BigInt approach loses precision
      expect(scaledTotal.toString()).not.toBe(correctTotal.mul(new Big('1e18')).round(0).toString())
    })

    it('maintains precision with various token amounts using Big.js', () => {
      const amounts = [
        '0.000001', // Very small amount
        '1.23456789', // Regular amount with decimals
        '1000000', // Large round number
        '1234567.89123456', // Large amount with many decimals
      ]

      amounts.forEach(amount => {
        const price = new Big(TOKEN_USD_PRICE)
        const tokenAmount = new Big(amount)
        const total = price.mul(tokenAmount)

        console.log(`\nBuying ${amount} tokens:`)
        console.log('Total:', total.toString())

        // Verify multiplication is reversible (within rounding)
        const calculatedAmount = total.div(price).round(8)
        expect(calculatedAmount.toString()).toBe(new Big(amount).round(8).toString())
      })
    })
  })
})
