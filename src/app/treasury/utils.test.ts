import { describe, expect, it } from 'vitest'
import { formatAssetData, type AssetFormattingResult } from './utils'

describe('formatAssetData', () => {
  describe('RIF asset formatting', () => {
    it('should format RIF asset with amount and fiat amount', () => {
      const result = formatAssetData('RIF', {
        amount: '1234567.89',
        fiatAmount: '987654.32',
      })

      expect(result).toEqual({
        amount: '1,234,568', // RIF is ceiled
        symbol: 'RIF',
        fiatAmount: '987,654.32 USD',
      })
    })

    it('should format RIF asset with only amount', () => {
      const result = formatAssetData('RIF', {
        amount: '1234567.89',
        fiatAmount: undefined as any,
      })

      expect(result).toEqual({
        amount: '1,234,568',
        symbol: 'RIF',
        fiatAmount: undefined,
      })
    })

    it('should handle RIF asset with zero amount', () => {
      const result = formatAssetData('RIF', {
        amount: '0',
        fiatAmount: '0',
      })

      expect(result).toEqual({
        amount: '0',
        symbol: 'RIF',
        fiatAmount: '0.00 USD',
      })
    })

    it('should handle RIF asset with decimal amount', () => {
      const result = formatAssetData('RIF', {
        amount: '1234.56',
        fiatAmount: '567.89',
      })

      expect(result).toEqual({
        amount: '1,235', // RIF is ceiled
        symbol: 'RIF',
        fiatAmount: '567.89 USD',
      })
    })

    it('should handle case-insensitive RIF title', () => {
      const result = formatAssetData('rif', {
        amount: '1000',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '1,000',
        symbol: 'RIF',
        fiatAmount: '500.00 USD',
      })
    })

    it('should handle RIF title with mixed case', () => {
      const result = formatAssetData('RiF', {
        amount: '1000',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '1,000',
        symbol: 'RIF',
        fiatAmount: '500.00 USD',
      })
    })
  })

  describe('RBTC asset formatting', () => {
    it('should format RBTC asset with amount and fiat amount', () => {
      const result = formatAssetData('RBTC', {
        amount: '123.45678901',
        fiatAmount: '987654.32',
      })

      expect(result).toEqual({
        amount: '123.45678901', // RBTC uses toFixedNoTrailing(8)
        symbol: 'rBTC',
        fiatAmount: '987,654.32 USD',
      })
    })

    it('should format RBTC asset with only amount', () => {
      const result = formatAssetData('RBTC', {
        amount: '123.45678901',
        fiatAmount: undefined as any,
      })

      expect(result).toEqual({
        amount: '123.45678901',
        symbol: 'rBTC',
        fiatAmount: undefined,
      })
    })

    it('should handle RBTC asset with zero amount', () => {
      const result = formatAssetData('RBTC', {
        amount: '0',
        fiatAmount: '0',
      })

      expect(result).toEqual({
        amount: '0',
        symbol: 'rBTC',
        fiatAmount: '0.00 USD',
      })
    })

    it('should handle RBTC asset with trailing zeros', () => {
      const result = formatAssetData('RBTC', {
        amount: '123.45000000',
        fiatAmount: '567.89',
      })

      expect(result).toEqual({
        amount: '123.45', // toFixedNoTrailing removes trailing zeros
        symbol: 'rBTC',
        fiatAmount: '567.89 USD',
      })
    })

    it('should handle RBTC asset with many decimal places', () => {
      const result = formatAssetData('RBTC', {
        amount: '0.12345678',
        fiatAmount: '567.89',
      })

      expect(result).toEqual({
        amount: '0.12345678',
        symbol: 'rBTC',
        fiatAmount: '567.89 USD',
      })
    })

    it('should handle case-insensitive RBTC title', () => {
      const result = formatAssetData('rbtc', {
        amount: '100.12345678',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '100.12345678',
        symbol: 'rBTC',
        fiatAmount: '500.00 USD',
      })
    })

    it('should handle RBTC title with mixed case', () => {
      const result = formatAssetData('RbTc', {
        amount: '100.12345678',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '100.12345678',
        symbol: 'rBTC',
        fiatAmount: '500.00 USD',
      })
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle undefined bucket', () => {
      const result = formatAssetData('RIF', undefined)

      expect(result).toEqual({
        amount: '0',
        symbol: 'RIF',
        fiatAmount: undefined,
      })
    })

    it('should handle undefined amount in bucket', () => {
      const result = formatAssetData('RIF', {
        amount: undefined as any,
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '0',
        symbol: 'RIF',
        fiatAmount: '500.00 USD',
      })
    })

    it('should handle undefined fiatAmount in bucket', () => {
      const result = formatAssetData('RIF', {
        amount: '1000',
        fiatAmount: undefined as any,
      })

      expect(result).toEqual({
        amount: '1,000',
        symbol: 'RIF',
        fiatAmount: undefined,
      })
    })

    it('should handle empty string amount', () => {
      const result = formatAssetData('RIF', {
        amount: '',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '0',
        symbol: 'RIF',
        fiatAmount: '500.00 USD',
      })
    })

    it('should handle empty string fiatAmount', () => {
      const result = formatAssetData('RIF', {
        amount: '1000',
        fiatAmount: '',
      })

      expect(result).toEqual({
        amount: '1,000',
        symbol: 'RIF',
        fiatAmount: undefined,
      })
    })

    it('should handle very large numbers', () => {
      const result = formatAssetData('RIF', {
        amount: '999999999999.99',
        fiatAmount: '1234567890.12',
      })

      expect(result).toEqual({
        amount: '1,000,000,000,000', // ceiled
        symbol: 'RIF',
        fiatAmount: '1,234,567,890.12 USD',
      })
    })

    it('should handle very small numbers', () => {
      const result = formatAssetData('RBTC', {
        amount: '0.00000001',
        fiatAmount: '0.000001',
      })

      expect(result).toEqual({
        amount: '0.00000001',
        symbol: 'rBTC',
        fiatAmount: '0.00 USD', // fiat amounts are toFixed(2)
      })
    })

    it('should handle negative numbers', () => {
      const result = formatAssetData('RIF', {
        amount: '-1234.56',
        fiatAmount: '-567.89',
      })

      expect(result).toEqual({
        amount: '-1,234', // ceiled for negative numbers
        symbol: 'RIF',
        fiatAmount: '-567.89 USD',
      })
    })

    it('should handle unknown asset type (defaults to rBTC)', () => {
      const result = formatAssetData('UNKNOWN', {
        amount: '123.45678901',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '123.45678901',
        symbol: 'rBTC',
        fiatAmount: '500.00 USD',
      })
    })

    it('should handle empty title', () => {
      const result = formatAssetData('', {
        amount: '123.45678901',
        fiatAmount: '500',
      })

      expect(result).toEqual({
        amount: '123.45678901',
        symbol: 'rBTC',
        fiatAmount: '500.00 USD',
      })
    })
  })

  describe('Type safety', () => {
    it('should return correct AssetFormattingResult type', () => {
      const result: AssetFormattingResult = formatAssetData('RIF', {
        amount: '1000',
        fiatAmount: '500',
      })

      expect(typeof result.amount).toBe('string')
      expect(typeof result.symbol).toBe('string')
      expect(result.fiatAmount === undefined || typeof result.fiatAmount === 'string').toBe(true)
    })

    it('should handle null values gracefully', () => {
      const result = formatAssetData('RIF', {
        amount: null as any,
        fiatAmount: null as any,
      })

      expect(result).toEqual({
        amount: '0',
        symbol: 'RIF',
        fiatAmount: undefined,
      })
    })
  })

  describe('Number formatting consistency', () => {
    it('should format numbers with proper commas', () => {
      const result = formatAssetData('RIF', {
        amount: '1234567.89',
        fiatAmount: '1234567.89',
      })

      expect(result.amount).toContain(',')
      expect(result.fiatAmount).toContain(',')
    })

    it('should handle decimal precision correctly for RIF', () => {
      const result = formatAssetData('RIF', {
        amount: '1234.567',
        fiatAmount: '567.123',
      })

      // RIF amounts are ceiled, so 1234.567 becomes 1235
      expect(result.amount).toBe('1,235')
      expect(result.fiatAmount).toBe('567.12 USD') // fiat amounts are toFixed(2)
    })

    it('should handle decimal precision correctly for RBTC', () => {
      const result = formatAssetData('RBTC', {
        amount: '1234.56789012',
        fiatAmount: '567.123',
      })

      // RBTC amounts use toFixedNoTrailing(8) but still get comma formatting
      expect(result.amount).toBe('1,234.56789012')
      expect(result.fiatAmount).toBe('567.12 USD')
    })
  })
})
