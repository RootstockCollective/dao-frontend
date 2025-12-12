import { describe, it, expect, beforeAll } from 'vitest'
import { parseUnits, encodeFunctionData } from 'viem'
import { uniswapProvider } from './uniswap'
import { ROUTER_ADDRESSES, SWAP_TOKEN_ADDRESSES } from '../constants'
import { getTokenDecimals } from '../utils'
import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'

describe('uniswap provider - integration tests', () => {
  // Use real token addresses from constants
  const realTokenIn = SWAP_TOKEN_ADDRESSES.USDT0
  const realTokenOut = SWAP_TOKEN_ADDRESSES.USDRIF
  let tokenInDecimals: number
  let tokenOutDecimals: number

  // Check if we have real contract addresses configured
  const hasRealAddresses =
    ROUTER_ADDRESSES.UNISWAP_QUOTER_V2 &&
    ROUTER_ADDRESSES.UNISWAP_QUOTER_V2 !== '0x0000000000000000000000000000000000000000' &&
    realTokenIn &&
    realTokenOut

  beforeAll(async () => {
    if (hasRealAddresses) {
      try {
        // Get real token decimals
        tokenInDecimals = await getTokenDecimals(realTokenIn)
        tokenOutDecimals = await getTokenDecimals(realTokenOut)
      } catch (error) {
        console.warn('Failed to fetch token decimals, some tests may be skipped:', error)
      }
    }
  })

  describe('getQuote - with specific fee tier', () => {
    it.skipIf(!hasRealAddresses)(
      'should return quote for specified fee tier from real contract',
      async () => {
        // Use 1 USDT0 as input
        // Note: USDT0 has 6 decimals on mainnet, USDRIF has 18 decimals
        const amountIn = parseUnits('1', tokenInDecimals)

        // Use fee tier 100 (0.01%) - this is the actual fee tier for USDT0/USDRIF pool on mainnet
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          feeTier: 100, // Actual fee tier for this pool
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
      'should return error when requested fee tier does not exist',
      async () => {
        // Request fee tier 200 which is not a valid Uniswap V3 fee tier
        // Valid Uniswap V3 fee tiers are: 100, 500, 3000, 10000
        // Should return an error (no fallback when specific tier is requested)
        const amountIn = parseUnits('1', tokenInDecimals)
        const invalidFeeTier = 200

        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          feeTier: invalidFeeTier, // Invalid fee tier, should return error
        })

        // Should return error for non-existent fee tier
        expect(result.provider).toBe('uniswap')
        expect(result.error).toBeDefined()
        expect(result.error).toContain(`Pool does not exist for fee tier ${invalidFeeTier}`)
        expect(result.amountOut).toBe('0')
        expect(result.amountOutRaw).toBe('0')
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

        // Use fee tier 100 which exists for this pool
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          feeTier: 100, // Use existing pool to verify formatting
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

        // Use fee tier 100 which exists for this pool
        // This test verifies ABI correctness, so we use a working pool
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          feeTier: 100, // Use existing pool to verify ABI works
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
        const result = await uniswapProvider.getQuote({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amountIn,
          tokenInDecimals,
          tokenOutDecimals,
          feeTier: 100, // Use existing pool
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
})
