import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('posthog-js', () => ({ default: { reset: vi.fn(), register: vi.fn() } }))

import { selectIsAuthenticated, selectUserAddress, useSiweStore } from './siweStore'

const STORAGE_KEY = 'siwe-auth-storage'
const ADDRESS = '0xabcdef0123456789abcdef0123456789abcdef01'

const futureSession = () => ({ userAddress: ADDRESS, expiresAt: Date.now() + 60_000 })

describe('useSiweStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useSiweStore.setState({ session: null, isLoading: false, error: null })
  })

  it('persists only the session', () => {
    const session = futureSession()

    useSiweStore.getState().setSession(session)

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ state: { session }, version: 1 })
  })

  it('drops a JWT persisted by the previous version', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { jwtToken: 'header.payload.signature' }, version: 0 }))

    await useSiweStore.persist.rehydrate()

    expect(useSiweStore.getState().session).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain('header.payload.signature')
  })

  it('clears an expired session on rehydration', async () => {
    const expired = { userAddress: ADDRESS, expiresAt: Date.now() - 1 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { session: expired }, version: 1 }))

    await useSiweStore.persist.rehydrate()

    expect(useSiweStore.getState().session).toBeNull()
  })

  it('treats a live session as authenticated', () => {
    useSiweStore.getState().setSession(futureSession())

    expect(selectIsAuthenticated(useSiweStore.getState())).toBe(true)
    expect(selectUserAddress(useSiweStore.getState())).toBe(ADDRESS)
  })

  it('treats an expired session as signed out', () => {
    useSiweStore.getState().setSession({ userAddress: ADDRESS, expiresAt: Date.now() - 1 })

    expect(selectIsAuthenticated(useSiweStore.getState())).toBe(false)
  })

  it('clearSession forgets the session without calling logout', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    useSiweStore.getState().setSession(futureSession())

    useSiweStore.getState().clearSession()

    expect(useSiweStore.getState().session).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
