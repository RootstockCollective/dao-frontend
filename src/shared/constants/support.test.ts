import { describe, expect, it } from 'vitest'

import { isValidSupportReference } from './support'

const ADDRESS = '0x1234567890abcdefABCDEF1234567890abcdef12'
const TX_HASH = `0x${'a'.repeat(64)}`

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

  it.each([
    ['empty', ''],
    ['missing 0x prefix', ADDRESS.slice(2)],
    ['non-hex characters', `0x${'z'.repeat(40)}`],
    ['trailing whitespace', `${ADDRESS} `],
    ['one char short', ADDRESS.slice(0, -1)],
    ['one char long', `${ADDRESS}0`],
  ])('rejects %s', (_label, value) => {
    expect(isValidSupportReference('Wallet address', value)).toBe(false)
  })
})
