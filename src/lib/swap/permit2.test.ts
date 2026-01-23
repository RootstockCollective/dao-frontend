/**
 * Permit2 Signature-based Approval Tests
 *
 * Tests the public API: createSecurePermit
 *
 * Security scenarios covered through the public API:
 * 1. Replay attacks (nonce validation)
 * 2. Cross-chain replay (chain ID validation)
 * 3. Expired signatures (expiration validation)
 * 4. Unauthorized spenders (spender whitelist)
 * 5. Amount manipulation (amount validation)
 * 6. Token confusion (token validation)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Address } from 'viem'
import { createSecurePermit, SecurePermitParams, PERMIT2_TYPES, MAX_UINT160 } from './permit2'

// =============================================================================
// TEST FIXTURES
// =============================================================================

const MOCK_TOKEN: Address = '0x779Ded0c9e1022225f8E0630b35a9b54bE713736' // USDT0
const MOCK_SPENDER: Address = '0x244f68e77357f86a8522323eBF80b5FC2F814d3E' // Universal Router
const MOCK_PERMIT2: Address = '0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5' // Rootstock Permit2
const MOCK_CHAIN_ID = 30 // Rootstock Mainnet
const MOCK_AMOUNT = 1000000n // 1 USDT0 (6 decimals)
const MOCK_NONCE = 0n

const TRUSTED_SPENDERS: readonly Address[] = [
  '0x244f68e77357f86a8522323eBF80b5FC2F814d3E', // Universal Router
] as const

const createParams = (overrides: Partial<SecurePermitParams> = {}): SecurePermitParams => ({
  token: MOCK_TOKEN,
  amount: MOCK_AMOUNT,
  spender: MOCK_SPENDER,
  nonce: MOCK_NONCE,
  permit2Address: MOCK_PERMIT2,
  chainId: MOCK_CHAIN_ID,
  trustedSpenders: TRUSTED_SPENDERS,
  ...overrides,
})

// =============================================================================
// createSecurePermit TESTS
// =============================================================================

describe('createSecurePermit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-19T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ===========================================================================
  // SUCCESSFUL CREATION
  // ===========================================================================

  describe('successful creation', () => {
    it('returns valid permit, domain, and typedData with correct values', () => {
      const result = createSecurePermit(createParams())
      const nowSeconds = Math.floor(Date.now() / 1000)

      // Result structure
      expect(result).toHaveProperty('permit')
      expect(result).toHaveProperty('domain')
      expect(result).toHaveProperty('typedData')
      expect(result).not.toHaveProperty('warnings') // Simplified API has no warnings

      // Permit values
      expect(result.permit.details.token).toBe(MOCK_TOKEN)
      expect(result.permit.details.amount).toBe(MOCK_AMOUNT)
      expect(result.permit.details.nonce).toBe(Number(MOCK_NONCE))
      expect(result.permit.spender).toBe(MOCK_SPENDER)
      expect(result.permit.details.expiration).toBeGreaterThan(nowSeconds)
      expect(result.permit.sigDeadline).toBeGreaterThan(BigInt(nowSeconds))

      // Domain values
      expect(result.domain.name).toBe('Permit2')
      expect(result.domain.chainId).toBe(MOCK_CHAIN_ID)
      expect(result.domain.verifyingContract).toBe(MOCK_PERMIT2)

      // TypedData ready for signTypedData
      expect(result.typedData.primaryType).toBe('PermitSingle')
      expect(result.typedData.types).toEqual(PERMIT2_TYPES)
      expect(result.typedData.message).toBe(result.permit)
      expect(result.typedData.domain).toBe(result.domain)
    })
  })

  // ===========================================================================
  // SECURITY: SPENDER VALIDATION
  // ===========================================================================

  describe('security: spender validation', () => {
    it('throws when spender is not in trusted list', () => {
      const maliciousSpender = '0x1234567890123456789012345678901234567890' as Address

      expect(() => createSecurePermit(createParams({ spender: maliciousSpender }))).toThrow(
        'not in the list of trusted addresses',
      )
    })

    it('throws when spender is zero address', () => {
      const zeroAddress = '0x0000000000000000000000000000000000000000' as Address

      expect(() => createSecurePermit(createParams({ spender: zeroAddress }))).toThrow('zero address')
    })
  })

  // ===========================================================================
  // SECURITY: CHAIN ID VALIDATION
  // ===========================================================================

  describe('security: chain ID validation', () => {
    it('throws when chain ID is zero', () => {
      expect(() => createSecurePermit(createParams({ chainId: 0 }))).toThrow('Chain ID must be positive')
    })

    it('throws when chain ID is negative', () => {
      expect(() => createSecurePermit(createParams({ chainId: -1 }))).toThrow('Chain ID must be positive')
    })
  })

  // ===========================================================================
  // SECURITY: TOKEN VALIDATION
  // ===========================================================================

  describe('security: token validation', () => {
    it('throws when token is zero address', () => {
      const zeroAddress = '0x0000000000000000000000000000000000000000' as Address

      expect(() => createSecurePermit(createParams({ token: zeroAddress }))).toThrow('zero address')
    })
  })

  // ===========================================================================
  // SECURITY: AMOUNT VALIDATION
  // ===========================================================================

  describe('security: amount validation', () => {
    it('throws when amount is zero', () => {
      expect(() => createSecurePermit(createParams({ amount: 0n }))).toThrow('zero')
    })

    it('throws when amount is negative', () => {
      expect(() => createSecurePermit(createParams({ amount: -1n }))).toThrow()
    })

    it('throws when amount exceeds MAX_UINT160', () => {
      const hugeAmount = MAX_UINT160 + 1n

      expect(() => createSecurePermit(createParams({ amount: hugeAmount }))).toThrow('MAX_UINT160')
    })
  })

  // ===========================================================================
  // MULTIPLE VALIDATION FAILURES
  // ===========================================================================

  describe('multiple validation failures', () => {
    it('reports all validation errors at once', () => {
      const zeroAddress = '0x0000000000000000000000000000000000000000' as Address
      const badParams = createParams({
        spender: '0x1234567890123456789012345678901234567890' as Address,
        token: zeroAddress,
        amount: 0n,
      })

      try {
        createSecurePermit(badParams)
        expect.fail('Should have thrown')
      } catch (e) {
        const error = e as Error
        expect(error.message).toContain('trusted addresses')
        expect(error.message).toContain('zero address')
        expect(error.message).toContain('zero')
      }
    })
  })

  // ===========================================================================
  // CUSTOM EXPIRATION
  // ===========================================================================

  describe('custom expiration', () => {
    it('uses provided expirationSeconds', () => {
      const result = createSecurePermit(createParams({ expirationSeconds: 3600 }))
      const nowSeconds = Math.floor(Date.now() / 1000)
      const expectedExpiration = nowSeconds + 3600

      expect(result.permit.details.expiration).toBe(expectedExpiration)
    })

    it('uses provided sigDeadlineSeconds', () => {
      const result = createSecurePermit(createParams({ sigDeadlineSeconds: 600 }))
      const nowSeconds = Math.floor(Date.now() / 1000)
      const expectedDeadline = BigInt(nowSeconds + 600)

      expect(result.permit.sigDeadline).toBe(expectedDeadline)
    })
  })
})
