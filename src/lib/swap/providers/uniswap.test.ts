import { describe, it, expect, beforeAll } from 'vitest'
import { parseUnits, encodeFunctionData } from 'viem'
import { uniswapProvider } from './uniswap'
import { ROUTER_ADDRESSES, SWAP_TOKEN_ADDRESSES } from '../constants'
import { getTokenDecimals } from '../utils'
import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import { tokenContracts } from '@/lib/contracts'
import { RIF } from '@/lib/constants'

describe('uniswap provider - integration tests', () => {
  // Use real token addresses from constants
  const realTokenIn = SWAP_TOKEN_ADDRESSES.USDT0
  const realTokenOut = SWAP_TOKEN_ADDRESSES.USDRIF
  const rifToken = tokenContracts[RIF]
  let tokenInDecimals: number
  let tokenOutDecimals: number
  let rifDecimals: number

  // Check if we have real contract addresses configured
  const hasRealAddresses =
    ROUTER_ADDRESSES.UNISWAP_QUOTER_V2 &&
    ROUTER_ADDRESSES.UNISWAP_QUOTER_V2 !== '0x0000000000000000000000000000000000000000' &&
    realTokenIn &&
    realTokenOut

  // Additional check for tests that use RIF token
  const hasRifToken = hasRealAddresses && rifToken

  beforeAll(async () => {
    if (hasRealAddresses) {
      try {
        // Get real token decimals
        tokenInDecimals = await getTokenDecimals(realTokenIn)
        tokenOutDecimals = await getTokenDecimals(realTokenOut)
        rifDecimals = await getTokenDecimals(rifToken)
      } catch (error) {
        console.warn('Failed to fetch token decimals, some tests may be skipped:', error)
      }
    }
  })

  describe('getQuote - with real contract', () => {
    it.skipIf(!hasRealAddresses)(
      'should return quote from real contract',
      async () => {
        // Use 1 USDT0 as input
        // Note: USDT0 has 6 decimals on mainnet, USDRIF has 18 decimals
        const amountIn = parseUnits('1', tokenInDecimals)

        // Don't specify fee tier - let the provider find the correct one
        // The pool fee tier may vary depending on fork state
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // Verify structure and types
        expect(result).toHaveProperty('provider')
        expect(result).toHaveProperty('amountOut')
        expect(result).toHaveProperty('amountOutRaw')
        expect(result.provider).toBe('uniswap')
        expect(typeof result.amountOut).toBe('string')
        expect(typeof result.amountOutRaw).toBe('string')

        // Quote MUST succeed - this is a real pool that exists
        // Protect against false positives: verify no error AND values are valid
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(result.amountOutRaw).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
        // Gas estimate should be present
        if (result.gasEstimate) {
          expect(parseInt(result.gasEstimate)).toBeGreaterThan(0)
        }
      },
      10000,
    )

    it.skipIf(!hasRealAddresses)(
      'should ignore invalid feeTier parameter and fallback to find working tier',
      async () => {
        // Request fee tier 200 which is not a valid Uniswap V3 fee tier
        // Valid Uniswap V3 fee tiers are: 100, 500, 3000, 10000
        // Implementation should fallback to try other tiers and succeed
        const amountIn = parseUnits('1', tokenInDecimals)
        const invalidFeeTier = 200

        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          feeTier: invalidFeeTier, // Invalid tier - will be ignored, fallback kicks in
        })

        // Should succeed by finding a valid tier (implementation falls back to all tiers)
        expect(result.provider).toBe('uniswap')
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        // Should return the actual tier that worked
        expect(result.feeTier).toBeDefined()
        expect([100, 500, 3000, 10000]).toContain(result.feeTier)
      },
      10000,
    )

    it.skipIf(!hasRealAddresses)(
      'should return error quote with correct structure when contract call fails',
      async () => {
        // Use invalid token addresses to force a contract error
        // This tests that error handling works correctly
        const invalidTokenIn = '0x0000000000000000000000000000000000000001' as const
        const invalidTokenOut = '0x0000000000000000000000000000000000000002' as const
        const amountIn = 1000000n

        const result = await uniswapProvider.getQuote({
          tokenIn: invalidTokenIn,
          tokenOut: invalidTokenOut,
          amountIn,
          tokenInDecimals: 18,
          tokenOutDecimals: 18,
          feeTier: 3000,
        })

        // Should always return valid error structure
        expect(result.provider).toBe('uniswap')
        expect(result).toHaveProperty('amountOut')
        expect(result).toHaveProperty('amountOutRaw')
        expect(result).toHaveProperty('error')
        expect(result.amountOut).toBe('0')
        expect(result.amountOutRaw).toBe('0')
        expect(typeof result.error).toBe('string')
        expect(result.error!.length).toBeGreaterThan(0)
      },
      10000,
    )
  })

  describe('getQuote - without fee tier (uses default)', () => {
    it.skipIf(!hasRealAddresses)(
      'should use default fee tier when no tier is specified',
      async () => {
        const amountIn = 1000000n // 1 USDT0

        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // Verify structure
        expect(result.provider).toBe('uniswap')
        expect(result).toHaveProperty('amountOut')
        expect(result).toHaveProperty('amountOutRaw')

        // Default tier (100) should work for this pool
        // Protect against false positives: verify no error AND values are valid
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(result.amountOutRaw).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
      },
      30000,
    )

    it.skipIf(!hasRealAddresses)(
      'should correctly format amounts returned from real contract',
      async () => {
        // Use 1 USDT0 (6 decimals on mainnet)
        const amountIn = parseUnits('1', tokenInDecimals)

        // Don't specify fee tier - let provider find the correct one
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // Quote MUST succeed to verify formatting
        // Protect against false positives: verify no error AND values are valid
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(result.amountOutRaw).not.toBe('0')
        // Verify amountOut is a properly formatted string (decimal number)
        expect(result.amountOut).toMatch(/^\d+(\.\d+)?$/)
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        // Verify amountOutRaw is the raw bigint as string (no decimals)
        expect(result.amountOutRaw).toMatch(/^\d+$/)
        expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
        // Verify they represent the same value (formatted vs raw)
        const formattedValue = parseFloat(result.amountOut)
        const rawValue = BigInt(result.amountOutRaw)
        const expectedFormatted = Number(rawValue) / 10 ** tokenOutDecimals
        expect(Math.abs(formattedValue - expectedFormatted)).toBeLessThan(0.000001) // Allow small floating point differences
      },
      10000,
    )
  })

  describe('provider interface', () => {
    it('should have correct provider name', () => {
      expect(uniswapProvider.name).toBe('uniswap')
    })

    it('should have getQuote function', () => {
      expect(typeof uniswapProvider.getQuote).toBe('function')
    })
  })

  describe('contract interaction - ABI and contract verification', () => {
    it.skipIf(!hasRealAddresses)(
      'should successfully call real QuoterV2 contract with correct ABI',
      async () => {
        // Use 1 USDT0 (6 decimals on mainnet)
        const amountIn = parseUnits('1', tokenInDecimals)

        // Don't specify fee tier - let provider find the correct one
        // This test verifies ABI correctness, so we use a working pool
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // If this succeeds, it means:
        // 1. The contract address is correct
        // 2. The ABI matches the contract interface
        // 3. The function name is correct
        // 4. The parameters are in the right format

        // ABI and contract interaction must be correct - quote must succeed
        expect(result.provider).toBe('uniswap')
        expect(result).toHaveProperty('amountOut')
        expect(result).toHaveProperty('amountOutRaw')

        // Protect against false positives: verify no error AND values are valid
        expect(result.error).toBeUndefined()
        // Ensure we didn't get empty/zero values (which would indicate an error was caught)
        expect(result.amountOut).not.toBe('0')
        expect(result.amountOutRaw).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)

        // Verify the formatted and raw values are consistent
        const formattedValue = parseFloat(result.amountOut)
        const rawValue = BigInt(result.amountOutRaw)
        const expectedFormatted = Number(rawValue) / 10 ** tokenOutDecimals
        expect(Math.abs(formattedValue - expectedFormatted)).toBeLessThan(0.000001)
      },
      10000,
    )

    it.skipIf(!hasRealAddresses)(
      'should verify ABI matches contract interface for quoteExactInputSingle',
      async () => {
        // This test verifies that our ABI correctly matches the contract interface
        // by checking the ABI structure and encoding/decoding function calls

        // 1. Verify the function exists in the ABI
        const quoteFunction = UniswapQuoterV2Abi.find(
          item => item.type === 'function' && item.name === 'quoteExactInputSingle',
        )
        expect(quoteFunction).toBeDefined()
        expect(quoteFunction?.name).toBe('quoteExactInputSingle')
        expect(quoteFunction?.stateMutability).toBe('view')

        // 2. Verify input parameters structure
        expect(quoteFunction?.inputs).toBeDefined()
        expect(quoteFunction?.inputs?.length).toBe(1)
        const paramsInput = quoteFunction?.inputs?.[0]
        expect(paramsInput?.type).toBe('tuple')
        expect(paramsInput?.internalType).toBe('struct IQuoterV2.QuoteExactInputSingleParams')

        // 3. Verify tuple components
        const components = paramsInput?.components
        expect(components).toBeDefined()
        expect(components?.length).toBe(5)
        expect(components?.[0]).toMatchObject({ name: 'tokenIn', type: 'address' })
        expect(components?.[1]).toMatchObject({ name: 'tokenOut', type: 'address' })
        expect(components?.[2]).toMatchObject({ name: 'amountIn', type: 'uint256' })
        expect(components?.[3]).toMatchObject({ name: 'fee', type: 'uint24' })
        expect(components?.[4]).toMatchObject({ name: 'sqrtPriceLimitX96', type: 'uint160' })

        // 4. Verify output parameters structure
        expect(quoteFunction?.outputs).toBeDefined()
        expect(quoteFunction?.outputs?.length).toBe(4)
        expect(quoteFunction?.outputs?.[0]).toMatchObject({ name: 'amountOut', type: 'uint256' })
        expect(quoteFunction?.outputs?.[1]).toMatchObject({
          name: 'sqrtPriceX96After',
          type: 'uint160',
        })
        expect(quoteFunction?.outputs?.[2]).toMatchObject({
          name: 'initializedTicksCrossed',
          type: 'uint32',
        })
        expect(quoteFunction?.outputs?.[3]).toMatchObject({ name: 'gasEstimate', type: 'uint256' })

        // 5. Verify we can encode function data with the ABI
        const amountIn = parseUnits('1', tokenInDecimals)
        const encodedData = encodeFunctionData({
          abi: UniswapQuoterV2Abi,
          functionName: 'quoteExactInputSingle',
          args: [
            {
              tokenIn: realTokenIn,
              tokenOut: realTokenOut,
              amountIn,
              fee: 100,
              sqrtPriceLimitX96: 0n,
            },
          ],
        })
        expect(encodedData).toBeDefined()
        expect(encodedData.startsWith('0x')).toBe(true)

        // 6. Make actual call to verify ABI works with real contract
        // Don't specify fee tier - let provider find the correct one
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // 7. Verify the call succeeded (proves ABI matches contract)
        expect(result).toBeDefined()
        expect(result.provider).toBe('uniswap')
        // Protect against false positives: verify no error AND values are valid
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(result.amountOutRaw).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
      },
      10000,
    )
  })

  describe('fee tier fallback behavior', () => {
    it.skipIf(!hasRealAddresses)(
      'should return feeTier in quote result when quote succeeds',
      async () => {
        // Request quote without specifying fee tier
        // The provider should find a working tier and include it in the result
        const amountIn = parseUnits('1', tokenInDecimals)

        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // Quote should succeed
        expect(result.provider).toBe('uniswap')
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)

        // Fee tier should be included in the result
        expect(result.feeTier).toBeDefined()
        expect(result.feeTier).toBeGreaterThan(0)
        // Should be one of the valid Uniswap V3 fee tiers
        expect([100, 500, 3000, 10000]).toContain(result.feeTier)
      },
      10000,
    )

    it.skipIf(!hasRifToken)(
      'should try all fee tiers and return error when no pool exists for token pair',
      async () => {
        // Use RIF -> USDT0 which likely doesn't have a direct pool at any tier
        // The provider should try all tiers and return an appropriate error
        const amountIn = parseUnits('100', rifDecimals)

        const result = await uniswapProvider.getQuote({
          tokenIn: rifToken,
          tokenOut: realTokenIn, // USDT0
          amountIn,
          tokenInDecimals: rifDecimals,
          tokenOutDecimals: tokenInDecimals,
        })

        // If no pool exists, should return error after trying all tiers
        if (result.error) {
          expect(result.provider).toBe('uniswap')
          expect(result.error).toContain('No liquidity available')
          expect(result.amountOut).toBe('0')
          expect(result.amountOutRaw).toBe('0')
        } else {
          // If a pool does exist, the quote should be valid with a fee tier
          expect(result.amountOut).not.toBe('0')
          expect(result.feeTier).toBeDefined()
          expect([100, 500, 3000, 10000]).toContain(result.feeTier)
        }
      },
      30000, // Longer timeout since it may try multiple tiers
    )

    it.skipIf(!hasRealAddresses)(
      'should return error with correct structure when all tiers fail for invalid tokens',
      async () => {
        // Use completely invalid token addresses to force all tiers to fail
        const invalidTokenIn = '0x0000000000000000000000000000000000000001' as const
        const invalidTokenOut = '0x0000000000000000000000000000000000000002' as const
        const amountIn = 1000000n

        const result = await uniswapProvider.getQuote({
          tokenIn: invalidTokenIn,
          tokenOut: invalidTokenOut,
          amountIn,
          tokenInDecimals: 18,
          tokenOutDecimals: 18,
        })

        // Should return error after trying all fee tiers
        expect(result.provider).toBe('uniswap')
        expect(result.error).toBeDefined()
        expect(result.error).toContain('No liquidity available')
        expect(result.amountOut).toBe('0')
        expect(result.amountOutRaw).toBe('0')
      },
      30000,
    )

    it.skipIf(!hasRealAddresses)(
      'should handle reverse direction quote (USDRIF -> USDT0)',
      async () => {
        // Test reverse direction to ensure fallback works in both directions
        const amountIn = parseUnits('1', tokenOutDecimals) // 1 USDRIF

        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenOut, // USDRIF
          tokenOut: realTokenIn, // USDT0
          amountIn,
          tokenInDecimals: tokenOutDecimals,
          tokenOutDecimals: tokenInDecimals,
        })

        // Quote should succeed (same pool, reverse direction)
        expect(result.provider).toBe('uniswap')
        expect(result.error).toBeUndefined()
        expect(result.amountOut).not.toBe('0')
        expect(parseFloat(result.amountOut)).toBeGreaterThan(0)

        // Fee tier should be included
        expect(result.feeTier).toBeDefined()
        expect([100, 500, 3000, 10000]).toContain(result.feeTier)
      },
      10000,
    )
  })

  describe('getQuoteExactOutput - exact output quotes', () => {
    it.skipIf(!hasRealAddresses)(
      'should return amountIn for a given amountOut from real contract',
      async () => {
        // Use 1 USDRIF (18 decimals) as desired output
        const amountOut = parseUnits('1', tokenOutDecimals)

        const result = await uniswapProvider.getQuoteExactOutput!({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountOut,
          tokenInDecimals,
          tokenOutDecimals,
        })

        // Verify structure and types
        expect(result).toHaveProperty('provider')
        expect(result).toHaveProperty('amountOut')
        expect(result).toHaveProperty('amountInRaw')
        expect(result.provider).toBe('uniswap')

        // Quote MUST succeed - this is a real pool that exists
        expect(result.error).toBeUndefined()
        expect(result.amountInRaw).toBeDefined()
        const amountInBigInt = BigInt(result.amountInRaw!)
        expect(amountInBigInt).toBeGreaterThan(0n)
        // For a stablecoin pair (USDT0 -> USDRIF), 1 USDRIF out should require ~1 USDT0 in
        // USDT0 has 6 decimals, so 1 USDT0 = 1_000_000
        // Allow range 0.5 to 2 USDT0 to account for fees and slippage
        expect(amountInBigInt).toBeGreaterThanOrEqual(500_000n) // >= 0.5 USDT0
        expect(amountInBigInt).toBeLessThanOrEqual(2_000_000n) // <= 2 USDT0
        // Fee tier should be returned
        expect(result.feeTier).toBeDefined()
        expect(result.feeTier).toBeGreaterThan(0)
      },
      10000,
    )

    it.skipIf(!hasRealAddresses)(
      'should return error when no liquidity available for exact output',
      async () => {
        // Use invalid token addresses to force a contract error
        const invalidTokenIn = '0x0000000000000000000000000000000000000001' as const
        const invalidTokenOut = '0x0000000000000000000000000000000000000002' as const
        const amountOut = 1000000n

        const result = await uniswapProvider.getQuoteExactOutput!({
          tokenIn: invalidTokenIn,
          tokenOut: invalidTokenOut,
          amountOut,
          tokenInDecimals: 18,
          tokenOutDecimals: 18,
        })

        // Should return valid error structure
        expect(result.provider).toBe('uniswap')
        expect(result).toHaveProperty('error')
        expect(typeof result.error).toBe('string')
        expect(result.error!.length).toBeGreaterThan(0)
      },
      10000,
    )
  })
})
