import { describe, expect, it } from 'vitest'

import {
  isSupportReferenceType,
  isValidSupportReference,
  MAX_SUPPORT_REFERENCE_LENGTH,
  SUPPORT_REFERENCE_MAX_LENGTHS,
  type SupportReferenceType,
} from './support'

const ADDRESS = '0x1234567890abcdefABCDEF1234567890abcdef12'
const TX_HASH = `0x${'a'.repeat(64)}`

const VALID_BY_TYPE: Record<SupportReferenceType, string> = {
  'Wallet address': ADDRESS,
  'Transaction hash': TX_HASH,
}

describe('isValidSupportReference', () => {
  it('accepts a well-formed address for the address type', () => {
    expect(isValidSupportReference('Wallet address', ADDRESS)).toBe(true)
  })

  it('accepts a well-formed tx hash for the tx type', () => {
    expect(isValidSupportReference('Transaction hash', TX_HASH)).toBe(true)
  })

  it('rejects a value of the wrong length for the selected type', () => {
    expect(isValidSupportReference('Wallet address', TX_HASH)).toBe(false)
    expect(isValidSupportReference('Transaction hash', ADDRESS)).toBe(false)
  })

  // Both shapes share one regex family, so every malformed case is checked against
  // both types — a fix applied to one branch only would fail here.
  describe.each(Object.keys(VALID_BY_TYPE) as SupportReferenceType[])('for %s', type => {
    const valid = VALID_BY_TYPE[type]
    const hexLength = valid.length - 2

    it.each([
      ['empty', ''],
      ['missing 0x prefix', valid.slice(2)],
      ['non-hex characters', `0x${'z'.repeat(hexLength)}`],
      ['leading whitespace', ` ${valid}`],
      ['trailing whitespace', `${valid} `],
      ['one char short', valid.slice(0, -1)],
      ['one char long', `${valid}0`],
      ['uppercase prefix', `0X${valid.slice(2)}`],
    ])('rejects %s', (_label, value) => {
      expect(isValidSupportReference(type, value)).toBe(false)
    })
  })
})

describe('isSupportReferenceType', () => {
  it.each(['Wallet address', 'Transaction hash'])('accepts %s', value => {
    expect(isSupportReferenceType(value)).toBe(true)
  })

  // The select emits '' when the user deselects; that must not pass as a type.
  it.each(['', 'wallet address', 'Wallet Address', 'ENS name'])('rejects %j', value => {
    expect(isSupportReferenceType(value)).toBe(false)
  })
})

describe('reference length caps', () => {
  it('caps each type at exactly the length of a valid value', () => {
    expect(SUPPORT_REFERENCE_MAX_LENGTHS['Wallet address']).toBe(ADDRESS.length)
    expect(SUPPORT_REFERENCE_MAX_LENGTHS['Transaction hash']).toBe(TX_HASH.length)
  })

  it('exposes the widest cap for use while no type is selected', () => {
    expect(MAX_SUPPORT_REFERENCE_LENGTH).toBe(TX_HASH.length)
  })
})
