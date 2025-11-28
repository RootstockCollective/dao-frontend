import { describe, it, expect } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET } from './route'
import { SWAP_TOKEN_ADDRESSES } from '@/lib/swap/constants'

describe('GET /api/swap/quote - integration tests', () => {
  const realTokenIn = SWAP_TOKEN_ADDRESSES.USDT0
  const realTokenOut = SWAP_TOKEN_ADDRESSES.USDRIF

  // Check if we have real contract addresses configured
  const hasRealAddresses =
    realTokenIn &&
    realTokenOut &&
    realTokenIn !== '0x0000000000000000000000000000000000000000' &&
    realTokenOut !== '0x0000000000000000000000000000000000000000'

  /**
   * Helper function to create a request and call the GET handler
   */
  async function callQuoteAPI(params: {
    amount: string
    tokenIn?: string
    tokenOut?: string
  }): Promise<{ response: NextResponse; data: any }> {
    const url = new URL('http://localhost/api/swap/quote')
    if (params.tokenIn) url.searchParams.set('tokenIn', params.tokenIn)
    if (params.tokenOut) url.searchParams.set('tokenOut', params.tokenOut)
    url.searchParams.set('amount', params.amount)

    const request = new NextRequest(url)
    const response = await GET(request)
    const data = await response.json()

    return { response, data }
  }

  /**
   * Helper function to verify a successful quote structure and values
   * This consolidates common assertions used across multiple tests
   */
  function expectSuccessfulQuote(quote: any) {
    expect(quote).toBeDefined()
    expect(quote).toHaveProperty('provider')
    expect(quote).toHaveProperty('amountOut')
    expect(quote).toHaveProperty('amountOutRaw')
    expect(typeof quote.provider).toBe('string')
    expect(typeof quote.amountOut).toBe('string')
    expect(typeof quote.amountOutRaw).toBe('string')
    // Protect against false positives: verify quote succeeded
    expect(quote.error).toBeUndefined()
    expect(quote.amountOut).not.toBe('0')
    expect(quote.amountOutRaw).not.toBe('0')
    expect(parseFloat(quote.amountOut)).toBeGreaterThan(0)
    expect(BigInt(quote.amountOutRaw)).toBeGreaterThan(0n)
  }

  describe('successful requests', () => {
    it.skipIf(!hasRealAddresses)(
      'should return successful quote with all parameters provided',
      async () => {
        // Tests successful quote when all parameters (tokenIn, tokenOut, amount) are provided
        // Verifies the API accepts parameters, scales amounts correctly, and returns valid quotes
        const { response, data } = await callQuoteAPI({
          tokenIn: realTokenIn,
          tokenOut: realTokenOut,
          amount: '2.5',
        })

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('quotes')
        expect(Array.isArray(data.quotes)).toBe(true)
        expect(data.quotes.length).toBe(1)
        expect(data.quotes[0].provider).toBe('uniswap')

        expectSuccessfulQuote(data.quotes[0])
      },
      30000,
    )

    it.skipIf(!hasRealAddresses)(
      'should return successful quote with default token addresses when not provided',
      async () => {
        // Tests that API uses default tokens (USDT0 -> USDRIF) when addresses are not provided
        // Also verifies decimal amount handling
        const { response, data } = await callQuoteAPI({
          amount: '1.5',
        })

        expect(response.status).toBe(200)
        expect(data.quotes).toBeDefined()
        expect(data.quotes.length).toBeGreaterThan(0)
        expectSuccessfulQuote(data.quotes[0])
      },
      30000,
    )
  })

  describe('error handling', () => {
    it('should return 400 for missing amount', async () => {
      const url = new URL('http://localhost/api/swap/quote')
      url.searchParams.set('tokenIn', realTokenIn)
      url.searchParams.set('tokenOut', realTokenOut)

      const request = new NextRequest(url)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid amount')
    })

    it('should return 400 for invalid amount', async () => {
      const { response, data } = await callQuoteAPI({
        amount: 'invalid',
      })

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid amount')
    })

    it('should return 400 for zero amount', async () => {
      const { response, data } = await callQuoteAPI({
        amount: '0',
      })

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid amount')
    })

    it('should return 400 for negative amount', async () => {
      const { response, data } = await callQuoteAPI({
        amount: '-100',
      })

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid amount')
    })
  })

  describe('input validation', () => {
    // Note: These tests verify that invalid/empty token addresses don't break the API
    // and that successful quotes are returned. The API implementation falls back to
    // default tokens (USDT0/USDRIF) when invalid addresses are provided. We verify
    // the public API behavior (successful quotes) rather than internal fallback logic,
    // which is an implementation detail.
    it.skipIf(!hasRealAddresses)(
      'should return successful quote when invalid tokenIn address is provided (falls back to default)',
      async () => {
        // When invalid tokenIn is provided, API should fall back to default (USDT0) and return successful quote
        // We verify the API accepts invalid address and returns successful quote (public behavior)
        const { response, data } = await callQuoteAPI({
          tokenIn: 'invalid-address',
          tokenOut: realTokenOut,
          amount: '1',
        })

        // Should fall back to defaults and return successful quote
        expect(response.status).toBe(200)
        expect(data.quotes).toBeDefined()
        expect(data.quotes.length).toBeGreaterThan(0)
        expectSuccessfulQuote(data.quotes[0])
      },
      30000,
    )

    it.skipIf(!hasRealAddresses)(
      'should return successful quote when empty tokenIn is provided (uses default)',
      async () => {
        // When empty tokenIn is provided, API should use default (USDT0) and return successful quote
        const { response, data } = await callQuoteAPI({
          tokenIn: '',
          tokenOut: realTokenOut,
          amount: '1',
        })

        expect(response.status).toBe(200)
        expect(data.quotes).toBeDefined()
        expect(data.quotes.length).toBeGreaterThan(0)
        expectSuccessfulQuote(data.quotes[0])
      },
      30000,
    )

    it.skipIf(!hasRealAddresses)(
      'should return successful quote when empty tokenOut is provided (uses default)',
      async () => {
        // When empty tokenOut is provided, API should use default (USDRIF) and return successful quote
        const { response, data } = await callQuoteAPI({
          tokenIn: realTokenIn,
          tokenOut: '',
          amount: '1',
        })

        expect(response.status).toBe(200)
        expect(data.quotes).toBeDefined()
        expect(data.quotes.length).toBeGreaterThan(0)
        expectSuccessfulQuote(data.quotes[0])
      },
      30000,
    )
  })

  describe('response format', () => {
    it.skipIf(!hasRealAddresses)(
      'should return quote with correct structure and format',
      async () => {
        // Comprehensive test for quote structure: provider, amounts, types, and optional fields
        const { data } = await callQuoteAPI({
          amount: '1',
        })

        const quote = data.quotes[0]

        // Verify structure and types
        expect(quote.provider).toBe('uniswap')
        expect(typeof quote.amountOut).toBe('string')
        expect(typeof quote.amountOutRaw).toBe('string')

        // Verify successful quote values
        expectSuccessfulQuote(quote)

        // Verify optional gasEstimate when available
        if (quote.gasEstimate) {
          expect(typeof quote.gasEstimate).toBe('string')
          expect(parseInt(quote.gasEstimate)).toBeGreaterThan(0)
        }
      },
      30000,
    )
  })
})
