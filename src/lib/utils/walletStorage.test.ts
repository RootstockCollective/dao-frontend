import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getWalletStorageKey, safeStorage } from './walletStorage'

describe('getWalletStorageKey', () => {
  it('scopes the prefix to the wallet, whatever the casing of the address', () => {
    expect(getWalletStorageKey('terms', '0x00000000000000000000000000000000000000Ab')).toBe(
      'terms-0x00000000000000000000000000000000000000ab',
    )
  })
})

describe('safeStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads back what it wrote', () => {
    safeStorage.set('key', { a: 1 })

    expect(safeStorage.get('key')).toEqual({ a: 1 })
  })

  it('reads a missing key as undefined', () => {
    expect(safeStorage.get('key')).toBeUndefined()
  })

  it('reads malformed JSON as undefined', () => {
    localStorage.setItem('key', 'not json')

    expect(safeStorage.get('key')).toBeUndefined()
  })

  it('removes a key', () => {
    safeStorage.set('key', true)
    safeStorage.remove('key')

    expect(safeStorage.get('key')).toBeUndefined()
  })

  it('never throws when the browser refuses storage', () => {
    const storage = Object.getPrototypeOf(localStorage)
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(storage, method).mockImplementation(() => {
        throw new Error('SecurityError')
      })
    }

    expect(safeStorage.get('key')).toBeUndefined()
    expect(() => safeStorage.set('key', true)).not.toThrow()
    expect(() => safeStorage.remove('key')).not.toThrow()
  })
})
