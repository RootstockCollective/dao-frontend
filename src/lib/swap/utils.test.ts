import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Address } from 'viem'
import Big from '@/lib/big'
import {
  scaleAmount,
  calculatePriceImpact,
  isValidAmount,
  getTokenDecimals,
  getTokenDecimalsBatch,
} from './utils'
import { publicClient } from '@/lib/viemPublicClient'

// Mock viem publicClient
vi.mock('@/lib/viemPublicClient', () => ({
  publicClient: {
    readContract: vi.fn(),
    multicall: vi.fn(),
  },
}))

const mockedPublicClient = vi.mocked(publicClient)

describe('swap/utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scaleAmount', () => {
    describe('error cases', () => {
      it('should throw error for empty amount', () => {
        expect(() => scaleAmount('', 18)).toThrow('Amount cannot be empty')
      })

      it('should throw error for whitespace-only amount', () => {
        expect(() => scaleAmount('   ', 18)).toThrow('Amount cannot be empty')
      })

      it('should throw error for invalid amount format', () => {
        expect(() => scaleAmount('invalid', 18)).toThrow('Failed to scale amount')
      })
    })

    describe('successful scaling', () => {
      // Comprehensive test cases covering various decimal combinations and edge cases
      const testCases = [
        // Different decimal precisions
        { decimals: 0, amount: '100', expected: 100n, description: '0 decimals (like some NFTs)' },
        { decimals: 2, amount: '100.50', expected: 10050n, description: '2 decimals (like fiat)' },
        {
          decimals: 6,
          amount: '1.0',
          expected: 1000000n,
          description: '6 decimals - 1 token (like USDT mainnet)',
        },
        { decimals: 6, amount: '100.5', expected: 100500000n, description: '6 decimals - decimal amount' },
        { decimals: 6, amount: '100.123456', expected: 100123456n, description: '6 decimals with precision' },
        {
          decimals: 6,
          amount: '1000000.123456',
          expected: 1000000123456n,
          description: '6 decimals - large amount',
        },
        { decimals: 8, amount: '1.0', expected: 100000000n, description: '8 decimals (like WBTC)' },
        { decimals: 8, amount: '0.00000001', expected: 1n, description: '8 decimals minimum unit' },
        {
          decimals: 18,
          amount: '1.0',
          expected: 1000000000000000000n,
          description: '18 decimals - 1 token (like ETH/USDRIF)',
        },
        {
          decimals: 18,
          amount: '100.5',
          expected: 100500000000000000000n,
          description: '18 decimals - decimal amount',
        },
        {
          decimals: 18,
          amount: '100',
          expected: 100000000000000000000n,
          description: '18 decimals - whole number',
        },
        {
          decimals: 18,
          amount: '0.000000000000000001',
          expected: 1n,
          description: '18 decimals minimum unit (1 wei)',
        },
        {
          decimals: 18,
          amount: '0.000001',
          expected: 1000000000000n,
          description: '18 decimals - small decimal amount',
        },
        {
          decimals: 18,
          amount: '1.123456789012345678',
          expected: 1123456789012345678n,
          description: '18 decimals - many decimal places',
        },
        {
          decimals: 18,
          amount: '1000.123456789012345678',
          expected: 1000123456789012345678n,
          description: '18 decimals with full precision',
        },
        // Edge cases
        { decimals: 6, amount: '0.5', expected: 500000n, description: '0.5 token with 6 decimals' },
        {
          decimals: 18,
          amount: '0.5',
          expected: 500000000000000000n,
          description: '0.5 token with 18 decimals',
        },
        { decimals: 6, amount: '1000', expected: 1000000000n, description: '1000 tokens with 6 decimals' },
        {
          decimals: 18,
          amount: '1000',
          expected: 1000000000000000000000n,
          description: '1000 tokens with 18 decimals',
        },
        {
          decimals: 18,
          amount: '0.0000000001',
          expected: 100000000n,
          description: 'very small amount with 18 decimals',
        },
        { decimals: 6, amount: '0.000001', expected: 1n, description: 'very small amount with 6 decimals' },
        {
          decimals: 6,
          amount: '999999.999999',
          expected: 999999999999n,
          description: 'large amount with 6 decimals',
        },
        {
          decimals: 18,
          amount: '999999.999999999999999999',
          expected: 999999999999999999999999n,
          description: 'large amount with 18 decimals',
        },
        {
          decimals: 6,
          amount: '123.456789',
          expected: 123456789n,
          description: 'precision preservation for 6 decimals',
        },
        {
          decimals: 18,
          amount: '123.456789012345678',
          expected: 123456789012345678000n,
          description: 'precision preservation for 18 decimals',
        },
      ]

      testCases.forEach(({ decimals, amount, expected, description }) => {
        it(`should correctly scale ${description}`, () => {
          const result = scaleAmount(amount, decimals)
          expect(result).toBe(expected)
        })
      })
    })
  })

  describe('isValidAmount', () => {
    it('should return true for positive number', () => {
      expect(isValidAmount('100')).toBe(true)
    })

    it('should return true for positive decimal', () => {
      expect(isValidAmount('100.5')).toBe(true)
    })

    it('should return true for small positive number', () => {
      expect(isValidAmount('0.000001')).toBe(true)
    })

    it('should return false for zero', () => {
      expect(isValidAmount('0')).toBe(false)
    })

    it('should return false for negative number', () => {
      expect(isValidAmount('-100')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidAmount('')).toBe(false)
    })

    it('should return false for invalid string', () => {
      expect(isValidAmount('invalid')).toBe(false)
    })

    it('should return false for non-numeric string', () => {
      expect(isValidAmount('abc123')).toBe(false)
    })

    it('should return true for scientific notation', () => {
      expect(isValidAmount('1e5')).toBe(true)
    })
  })

  describe('calculatePriceImpact', () => {
    it('should calculate positive price impact when getting less than spot (worse rate)', () => {
      const amountIn = '100'
      const amountOut = '95'
      const spotPrice = '1.0' // 1:1 ratio
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      expect(result?.toString()).toBe('5') // Positive = worse (getting 5% less)
      expect(result?.gt(0)).toBe(true) // Should be positive
    })

    it('should calculate zero price impact when effective price equals spot price', () => {
      const amountIn = '100'
      const amountOut = '100'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      expect(result?.toString()).toBe('0')
    })

    it('should calculate negative price impact when getting more than spot (better rate)', () => {
      const amountIn = '100'
      const amountOut = '105'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      expect(result?.toString()).toBe('-5') // Negative = better (getting 5% more)
      expect(result?.lt(0)).toBe(true) // Should be negative
    })

    it('should handle decimal amounts', () => {
      const amountIn = '100.5'
      const amountOut = '99.5'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      expect(result?.toNumber()).toBeCloseTo(0.995, 2)
    })

    it('should return undefined for zero or negative amountIn', () => {
      expect(calculatePriceImpact('0', '100', '1.0')).toBeUndefined()
      expect(calculatePriceImpact('-100', '100', '1.0')).toBeUndefined()
    })

    it('should handle very small positive price impact (worse rate)', () => {
      const amountIn = '100'
      const amountOut = '99.99'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      expect(result?.toString()).toBe('0.01') // Positive = worse
      expect(result?.gt(0)).toBe(true) // Should be positive
    })

    it('should handle very small negative price impact (better rate)', () => {
      const amountIn = '100'
      const amountOut = '100.01'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      expect(result?.toString()).toBe('-0.01') // Negative = better
      expect(result?.lt(0)).toBe(true) // Should be negative
    })

    it('should return undefined on calculation error', () => {
      const amountIn = 'invalid'
      const amountOut = '100'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeUndefined()
    })

    it('should return Big instance that can be formatted with any precision', () => {
      const amountIn = '100'
      const amountOut = '99.123456'
      const spotPrice = '1.0'
      const result = calculatePriceImpact(amountIn, amountOut, spotPrice)
      expect(result).toBeInstanceOf(Big)
      // Can format to any precision (positive = worse rate)
      expect(result?.toFixed(2)).toBe('0.88')
      expect(result?.toFixed(4)).toBe('0.8765')
      expect(result?.toFixed(6)).toBe('0.876544')
      expect(result?.gt(0)).toBe(true) // Should be positive (worse)
    })

    it('should distinguish between better and worse rates correctly', () => {
      // Worse rate: getting less than spot
      const worseResult = calculatePriceImpact('100', '90', '1.0')
      expect(worseResult?.gt(0)).toBe(true) // Positive = worse
      expect(worseResult?.toString()).toBe('10')

      // Better rate: getting more than spot
      const betterResult = calculatePriceImpact('100', '110', '1.0')
      expect(betterResult?.lt(0)).toBe(true) // Negative = better
      expect(betterResult?.toString()).toBe('-10')
    })
  })

  describe('getTokenDecimals', () => {
    const mockTokenAddress = '0x1234567890123456789012345678901234567890' as Address

    it('should return decimals for valid token', async () => {
      mockedPublicClient.readContract.mockResolvedValueOnce(18)

      const result = await getTokenDecimals(mockTokenAddress)

      expect(result).toBe(18)
      expect(mockedPublicClient.readContract).toHaveBeenCalledWith({
        address: mockTokenAddress,
        abi: expect.any(Array),
        functionName: 'decimals',
      })
    })

    it('should return 6 decimals for USDT-like token', async () => {
      mockedPublicClient.readContract.mockResolvedValueOnce(6)

      const result = await getTokenDecimals(mockTokenAddress)

      expect(result).toBe(6)
    })

    it('should throw error if contract call fails', async () => {
      const error = new Error('Contract call failed')
      mockedPublicClient.readContract.mockRejectedValueOnce(error)

      await expect(getTokenDecimals(mockTokenAddress)).rejects.toThrow('Failed to read decimals from token')
    })

    it('should throw error if result is not a number', async () => {
      mockedPublicClient.readContract.mockResolvedValueOnce('invalid' as any)

      await expect(getTokenDecimals(mockTokenAddress)).rejects.toThrow('Invalid decimals result')
    })

    it('should throw error if result is null', async () => {
      mockedPublicClient.readContract.mockResolvedValueOnce(null as any)

      await expect(getTokenDecimals(mockTokenAddress)).rejects.toThrow('Invalid decimals result')
    })
  })

  describe('getTokenDecimalsBatch', () => {
    const mockTokenAddress1 = '0x1111111111111111111111111111111111111111' as Address
    const mockTokenAddress2 = '0x2222222222222222222222222222222222222222' as Address
    const mockTokenAddress3 = '0x3333333333333333333333333333333333333333' as Address

    it('should return decimals for multiple tokens', async () => {
      mockedPublicClient.multicall.mockResolvedValueOnce([
        { status: 'success', result: 18 },
        { status: 'success', result: 6 },
        { status: 'success', result: 8 },
      ] as any)

      const result = await getTokenDecimalsBatch([mockTokenAddress1, mockTokenAddress2, mockTokenAddress3])

      expect(result).toEqual({
        [mockTokenAddress1]: 18,
        [mockTokenAddress2]: 6,
        [mockTokenAddress3]: 8,
      })
      expect(mockedPublicClient.multicall).toHaveBeenCalledWith({
        contracts: expect.arrayContaining([
          expect.objectContaining({
            address: mockTokenAddress1,
            functionName: 'decimals',
          }),
          expect.objectContaining({
            address: mockTokenAddress2,
            functionName: 'decimals',
          }),
          expect.objectContaining({
            address: mockTokenAddress3,
            functionName: 'decimals',
          }),
        ]),
      })
    })

    it('should handle single token', async () => {
      mockedPublicClient.multicall.mockResolvedValueOnce([{ status: 'success', result: 18 }] as any)

      const result = await getTokenDecimalsBatch([mockTokenAddress1])

      expect(result).toEqual({
        [mockTokenAddress1]: 18,
      })
    })

    it('should throw error if any contract call fails', async () => {
      mockedPublicClient.multicall.mockResolvedValueOnce([
        { status: 'success', result: 18 },
        { status: 'failure', result: null },
      ] as any)

      await expect(getTokenDecimalsBatch([mockTokenAddress1, mockTokenAddress2])).rejects.toThrow(
        'Failed to read decimals for token',
      )
      // Should not retry with Blockscout - only RPC call
      expect(mockedPublicClient.multicall).toHaveBeenCalledTimes(1)
    })

    it('should throw error if result is not a number', async () => {
      mockedPublicClient.multicall.mockResolvedValueOnce([{ status: 'success', result: 'invalid' }] as any)

      await expect(getTokenDecimalsBatch([mockTokenAddress1])).rejects.toThrow(
        'Failed to read decimals for token',
      )
    })

    it('should throw error if multicall fails', async () => {
      const error = new Error('Multicall failed')
      mockedPublicClient.multicall.mockRejectedValueOnce(error)

      await expect(getTokenDecimalsBatch([mockTokenAddress1])).rejects.toThrow(
        'Failed to read decimals batch',
      )
    })

    it('should handle empty array', async () => {
      mockedPublicClient.multicall.mockResolvedValueOnce([])

      const result = await getTokenDecimalsBatch([])

      expect(result).toEqual({})
    })
  })
})
