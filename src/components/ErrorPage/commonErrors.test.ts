import { describe, expect, it } from 'vitest'

import {
  createUserCanceledTxError,
  isUserRejectedTxError,
  USER_CANCELED_TX_MESSAGE,
} from './commonErrors'

describe('isUserRejectedTxError', () => {
  it('should return true for EIP-1193 code 4001 on the error object', () => {
    expect(isUserRejectedTxError({ code: 4001, message: 'rejected' })).toBe(true)
  })

  it('should return true for viem UserRejectedRequestError name', () => {
    expect(isUserRejectedTxError({ name: 'UserRejectedRequestError', message: 'x' })).toBe(true)
  })

  it('should return true for MetaMask-style message', () => {
    expect(isUserRejectedTxError(new Error('User rejected the request'))).toBe(true)
  })

  it('should return true for swap UX copy', () => {
    expect(isUserRejectedTxError(new Error(USER_CANCELED_TX_MESSAGE))).toBe(true)
  })

  it('should return true for createUserCanceledTxError', () => {
    expect(isUserRejectedTxError(createUserCanceledTxError())).toBe(true)
  })

  it('should return true when rejection is nested on cause', () => {
    const err = new Error('wrapped')
    Object.assign(err, { cause: { code: 4001 } })
    expect(isUserRejectedTxError(err)).toBe(true)
  })

  it('should return false for unrelated errors', () => {
    expect(isUserRejectedTxError(new Error('insufficient funds'))).toBe(false)
    expect(isUserRejectedTxError(null)).toBe(false)
  })

  it('should treat connector "hash is null/undefined" messages as user dismissal (DAO-2215 swap)', () => {
    expect(isUserRejectedTxError(new Error('hash is null'))).toBe(true)
    expect(isUserRejectedTxError(new Error('Transaction hash is null'))).toBe(true)
    expect(isUserRejectedTxError(new Error('hash is undefined'))).toBe(true)
  })
})

describe('createUserCanceledTxError', () => {
  it('should produce the canonical canceled message', () => {
    const err = createUserCanceledTxError()
    expect(err.message).toBe(USER_CANCELED_TX_MESSAGE)
  })
})
