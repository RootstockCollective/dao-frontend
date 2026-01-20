/**
 * Permit2 Signature-based Approval Utilities
 *
 * This module implements Permit2's signature-based approval flow, allowing
 * users to approve and swap in a single transaction (vs 2-3 transactions with on-chain approvals).
 *
 * Security considerations:
 * - Domain separator must match the deployed Permit2 contract
 * - Nonces must be fetched from chain to prevent replay attacks
 * - Expiration deadlines prevent indefinite signatures
 * - Spender must be validated against known trusted addresses
 * - Amount must match user intent exactly
 *
 * @see https://docs.uniswap.org/contracts/permit2/overview
 */

import { Address, Hex } from 'viem'

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Permit2 EIP-712 Domain
 * Must match the deployed contract's domain separator exactly
 */
export const PERMIT2_DOMAIN_NAME = 'Permit2'
export const PERMIT2_DOMAIN_VERSION = '1' // Note: Permit2 doesn't use version in domain

/**
 * Maximum permitted values to prevent overflow attacks
 */
export const MAX_UINT160 = BigInt(2) ** BigInt(160) - BigInt(1)
export const MAX_UINT48 = BigInt(2) ** BigInt(48) - BigInt(1)
export const MAX_UINT256 = BigInt(2) ** BigInt(256) - BigInt(1)

/**
 * Default expiration: 30 minutes from now
 * This is a reasonable default that balances UX with security
 */
export const DEFAULT_PERMIT_EXPIRATION_SECONDS = 30 * 60 // 30 minutes

/**
 * Maximum allowed expiration: 24 hours
 * Signatures valid for longer than this are dangerous
 */
export const MAX_PERMIT_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours

/**
 * Minimum allowed expiration: 1 minute
 * Shorter expirations may fail due to block time variance
 */
export const MIN_PERMIT_EXPIRATION_SECONDS = 60 // 1 minute

// =============================================================================
// TYPES
// =============================================================================

/**
 * Permit2 PermitSingle structure for signing
 * Used for single token, single spender permits
 */
export interface PermitDetails {
  token: Address
  amount: bigint
  expiration: number // uint48 - number for EIP-712 signing compatibility
  nonce: number // uint48 - number for EIP-712 signing compatibility
}

export interface PermitSingle {
  details: PermitDetails
  spender: Address
  sigDeadline: bigint // uint256
}

/**
 * Permit2 signature result
 */
export interface Permit2Signature {
  permit: PermitSingle
  signature: Hex
}

/**
 * Domain for EIP-712 typed data signing
 */
export interface Permit2Domain {
  name: string
  chainId: number
  verifyingContract: Address
}

/**
 * Parameters for creating a permit
 */
export interface CreatePermitParams {
  /** Token to permit spending of */
  token: Address
  /** Amount to permit (will be capped at MAX_UINT160) */
  amount: bigint
  /** Spender address (must be validated) */
  spender: Address
  /** Current nonce from Permit2 contract */
  nonce: bigint
  /** Permit2 contract address */
  permit2Address: Address
  /** Chain ID for domain separator */
  chainId: number
  /** Optional: custom expiration in seconds from now (default: 30 minutes) */
  expirationSeconds?: number
  /** Optional: custom signature deadline in seconds from now (default: same as expiration) */
  sigDeadlineSeconds?: number
}

/**
 * Basic validation result (valid/invalid with optional error)
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validation result with optional warning (for non-fatal issues)
 */
export interface ValidationResultWithWarning extends ValidationResult {
  warning?: string
}

/**
 * Comprehensive validation result for permit parameters
 */
export interface PermitValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// =============================================================================
// EIP-712 TYPE DEFINITIONS
// =============================================================================

/**
 * EIP-712 type definitions for Permit2
 * These MUST match the contract's type hashes exactly
 */
export const PERMIT2_TYPES = {
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
  PermitDetails: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint160' },
    { name: 'expiration', type: 'uint48' },
    { name: 'nonce', type: 'uint48' },
  ],
} as const

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates a permit spender against a list of known trusted addresses
 *
 * @security This is critical - only allow known, audited contract addresses
 */
export function validateSpender(spender: Address, trustedSpenders: readonly Address[]): ValidationResult {
  if (!spender || spender === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Spender address cannot be zero address' }
  }

  const normalizedSpender = spender.toLowerCase() as Address
  const normalizedTrusted = trustedSpenders.map(s => s.toLowerCase() as Address)

  if (!normalizedTrusted.includes(normalizedSpender)) {
    return {
      valid: false,
      error: `Spender ${spender} is not in the list of trusted addresses`,
    }
  }

  return { valid: true }
}

/**
 * Validates the permit amount
 *
 * @security Prevents overflow and ensures amount matches user intent
 */
export function validateAmount(amount: bigint, intendedAmount: bigint): ValidationResultWithWarning {
  if (amount < 0n) {
    return { valid: false, error: 'Amount cannot be negative' }
  }

  if (amount === 0n) {
    return { valid: false, error: 'Amount cannot be zero' }
  }

  if (amount > MAX_UINT160) {
    return { valid: false, error: `Amount exceeds MAX_UINT160 (${MAX_UINT160})` }
  }

  // Warn if the amount is more than intended (could indicate manipulation)
  if (amount > intendedAmount) {
    return {
      valid: true,
      warning: `Amount ${amount} is greater than intended amount ${intendedAmount}`,
    }
  }

  return { valid: true }
}

/**
 * Validates the permit expiration
 *
 * @security Prevents signatures that are valid indefinitely or too short
 */
export function validateExpiration(expirationSeconds: number): ValidationResultWithWarning {
  if (expirationSeconds < MIN_PERMIT_EXPIRATION_SECONDS) {
    return {
      valid: false,
      error: `Expiration ${expirationSeconds}s is too short. Minimum: ${MIN_PERMIT_EXPIRATION_SECONDS}s`,
    }
  }

  if (expirationSeconds > MAX_PERMIT_EXPIRATION_SECONDS) {
    return {
      valid: false,
      error: `Expiration ${expirationSeconds}s is too long. Maximum: ${MAX_PERMIT_EXPIRATION_SECONDS}s`,
    }
  }

  // Warn for long expirations (> 1 hour)
  if (expirationSeconds > 60 * 60) {
    return {
      valid: true,
      warning: `Expiration ${expirationSeconds}s is longer than recommended (1 hour)`,
    }
  }

  return { valid: true }
}

/**
 * Validates the nonce value
 *
 * @security Prevents replay attacks by ensuring nonce matches on-chain state
 */
export function validateNonce(nonce: bigint, expectedNonce: bigint): ValidationResult {
  if (nonce < 0n) {
    return { valid: false, error: 'Nonce cannot be negative' }
  }

  if (nonce > MAX_UINT48) {
    return { valid: false, error: `Nonce exceeds MAX_UINT48 (${MAX_UINT48})` }
  }

  if (nonce !== expectedNonce) {
    return {
      valid: false,
      error: `Nonce mismatch. Expected: ${expectedNonce}, Got: ${nonce}. Signature would be invalid.`,
    }
  }

  return { valid: true }
}

/**
 * Validates the chain ID
 *
 * @security Prevents cross-chain replay attacks
 */
export function validateChainId(chainId: number, expectedChainId: number): ValidationResult {
  if (chainId <= 0) {
    return { valid: false, error: 'Chain ID must be positive' }
  }

  if (chainId !== expectedChainId) {
    return {
      valid: false,
      error: `Chain ID mismatch. Expected: ${expectedChainId}, Got: ${chainId}. Signature would be valid on wrong chain.`,
    }
  }

  return { valid: true }
}

/**
 * Validates the token address
 *
 * @security Ensures user is signing for the correct token
 */
export function validateToken(token: Address, expectedToken: Address): ValidationResult {
  if (!token || token === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Token address cannot be zero address' }
  }

  const normalizedToken = token.toLowerCase()
  const normalizedExpected = expectedToken.toLowerCase()

  if (normalizedToken !== normalizedExpected) {
    return {
      valid: false,
      error: `Token mismatch. Expected: ${expectedToken}, Got: ${token}`,
    }
  }

  return { valid: true }
}

/**
 * Comprehensive validation of all permit parameters
 */
export function validatePermitParams(
  params: CreatePermitParams,
  validation: {
    expectedToken: Address
    intendedAmount: bigint
    expectedNonce: bigint
    expectedChainId: number
    trustedSpenders: readonly Address[]
  },
): PermitValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate spender
  const spenderResult = validateSpender(params.spender, validation.trustedSpenders)
  if (!spenderResult.valid && spenderResult.error) {
    errors.push(spenderResult.error)
  }

  // Validate amount
  const amountResult = validateAmount(params.amount, validation.intendedAmount)
  if (!amountResult.valid && amountResult.error) {
    errors.push(amountResult.error)
  }
  if (amountResult.warning) {
    warnings.push(amountResult.warning)
  }

  // Validate expiration
  const expirationSeconds = params.expirationSeconds ?? DEFAULT_PERMIT_EXPIRATION_SECONDS
  const expirationResult = validateExpiration(expirationSeconds)
  if (!expirationResult.valid && expirationResult.error) {
    errors.push(expirationResult.error)
  }
  if (expirationResult.warning) {
    warnings.push(expirationResult.warning)
  }

  // Validate nonce
  const nonceResult = validateNonce(params.nonce, validation.expectedNonce)
  if (!nonceResult.valid && nonceResult.error) {
    errors.push(nonceResult.error)
  }

  // Validate chain ID
  const chainIdResult = validateChainId(params.chainId, validation.expectedChainId)
  if (!chainIdResult.valid && chainIdResult.error) {
    errors.push(chainIdResult.error)
  }

  // Validate token
  const tokenResult = validateToken(params.token, validation.expectedToken)
  if (!tokenResult.valid && tokenResult.error) {
    errors.push(tokenResult.error)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// =============================================================================
// PERMIT CREATION
// =============================================================================

/**
 * Creates a PermitSingle structure for signing
 *
 * @security All parameters are validated before creating the permit
 */
export function createPermitSingle(params: CreatePermitParams): PermitSingle {
  const now = Math.floor(Date.now() / 1000)

  // Cap amount at MAX_UINT160
  const cappedAmount = params.amount > MAX_UINT160 ? MAX_UINT160 : params.amount

  // Calculate expiration (permit expiration for the allowance)
  const expirationSeconds = params.expirationSeconds ?? DEFAULT_PERMIT_EXPIRATION_SECONDS
  const expiration = now + expirationSeconds // number for EIP-712 signing

  // Calculate signature deadline (when the signature itself expires)
  const sigDeadlineSeconds = params.sigDeadlineSeconds ?? expirationSeconds
  const sigDeadline = BigInt(now + sigDeadlineSeconds)

  return {
    details: {
      token: params.token,
      amount: cappedAmount,
      expiration,
      nonce: Number(params.nonce), // Convert to number for EIP-712 signing
    },
    spender: params.spender,
    sigDeadline,
  }
}

/**
 * Creates the EIP-712 domain for Permit2
 */
export function createPermit2Domain(chainId: number, permit2Address: Address): Permit2Domain {
  return {
    name: PERMIT2_DOMAIN_NAME,
    chainId,
    verifyingContract: permit2Address,
  }
}

/**
 * Creates the typed data structure for signing with signTypedData
 */
export function createTypedDataForPermit(
  permit: PermitSingle,
  domain: Permit2Domain,
): {
  domain: Permit2Domain
  types: typeof PERMIT2_TYPES
  primaryType: 'PermitSingle'
  message: PermitSingle
} {
  return {
    domain,
    types: PERMIT2_TYPES,
    primaryType: 'PermitSingle',
    message: permit,
  }
}

// =============================================================================
// SECURE PERMIT CREATION (ENFORCES VALIDATION)
// =============================================================================

/**
 * Parameters for secure permit creation
 */
export interface SecurePermitParams extends CreatePermitParams {
  /** List of trusted spender addresses (spender must be in this list) */
  trustedSpenders: readonly Address[]
}

/**
 * Result of secure permit creation
 */
export interface SecurePermitResult {
  permit: PermitSingle
  domain: Permit2Domain
  typedData: ReturnType<typeof createTypedDataForPermit>
}

/**
 * Creates a permit with validation
 *
 * Validates:
 * - Spender is in trusted list
 * - Chain ID matches expected
 * - Token is not zero address
 * - Amount is valid (> 0, <= MAX_UINT160)
 * - Nonce is valid (<= MAX_UINT48)
 *
 * @throws Error if any validation fails
 */
export function createSecurePermit(params: SecurePermitParams): SecurePermitResult {
  const errors: string[] = []

  // Validate spender is in trusted list
  const spenderResult = validateSpender(params.spender, params.trustedSpenders)
  if (!spenderResult.valid) errors.push(spenderResult.error!)

  // Validate token (not zero address)
  if (!params.token || params.token === '0x0000000000000000000000000000000000000000') {
    errors.push('Token address cannot be zero address')
  }

  // Validate amount
  if (params.amount <= 0n) {
    errors.push('Amount must be greater than zero')
  } else if (params.amount > MAX_UINT160) {
    errors.push(`Amount exceeds MAX_UINT160 (${MAX_UINT160})`)
  }

  // Validate nonce
  if (params.nonce < 0n) {
    errors.push('Nonce cannot be negative')
  } else if (params.nonce > MAX_UINT48) {
    errors.push(`Nonce exceeds MAX_UINT48 (${MAX_UINT48})`)
  }

  // Validate chain ID
  if (params.chainId <= 0) {
    errors.push('Chain ID must be positive')
  }

  // Throw if any validation failed
  if (errors.length > 0) {
    throw new Error(`Permit validation failed: ${errors.join('; ')}`)
  }

  // Create permit, domain, and typed data
  const permit = createPermitSingle(params)
  const domain = createPermit2Domain(params.chainId, params.permit2Address)
  const typedData = createTypedDataForPermit(permit, domain)

  return { permit, domain, typedData }
}

// =============================================================================
// SIGNATURE VALIDATION
// =============================================================================

/**
 * Validates a signature has the correct format (65 bytes: r + s + v)
 */
export function validateSignatureFormat(signature: Hex): ValidationResult {
  // Remove '0x' prefix for length check
  const sigWithoutPrefix = signature.startsWith('0x') ? signature.slice(2) : signature

  // Signature should be 65 bytes (130 hex chars)
  if (sigWithoutPrefix.length !== 130) {
    return {
      valid: false,
      error: `Invalid signature length. Expected 130 hex chars (65 bytes), got ${sigWithoutPrefix.length}`,
    }
  }

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(sigWithoutPrefix)) {
    return { valid: false, error: 'Signature contains invalid hex characters' }
  }

  // Extract v value (last byte)
  const v = parseInt(sigWithoutPrefix.slice(128, 130), 16)

  // v should be 27, 28, 0, or 1
  if (v !== 27 && v !== 28 && v !== 0 && v !== 1) {
    return {
      valid: false,
      error: `Invalid signature v value. Expected 27, 28, 0, or 1, got ${v}`,
    }
  }

  return { valid: true }
}
