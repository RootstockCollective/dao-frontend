import { createElement, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { create } from 'zustand'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useLike } from './useLike'

vi.mock('@/shared/notification', () => ({
  showToast: vi.fn(),
}))

import { showToast } from '@/shared/notification'

const mockShowToast = vi.mocked(showToast)

const siweTestCtx = vi.hoisted(() => ({
  signOutSpy: vi.fn(),
}))

vi.mock('@/lib/auth/siweStore', () => {
  const useSiweStore = create<{
    jwtToken: string | null
    signOut: () => void
  }>(set => ({
    jwtToken: null,
    signOut: () => {
      siweTestCtx.signOutSpy()
      set({ jwtToken: null })
    },
  }))
  return { useSiweStore }
})

import { useSiweStore } from '@/lib/auth/siweStore'

const mockedFetch = vi.fn()
global.fetch = mockedFetch

function encodeJwtPayload(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.x`
}

function jwtExpiringIn(secondsFromNow: number): string {
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow
  return encodeJwtPayload({ exp, userAddress: '0x0000000000000000000000000000000000000001' })
}

const proposalId = 'prop-1'

const defaultLikeCounts = {
  success: true,
  proposalId,
  reactions: { heart: 3 },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  Wrapper.displayName = 'UseLikeTestWrapper'
  return Wrapper
}

function getAuthorizationHeader(init: RequestInit | undefined): string | null {
  if (!init?.headers) return null
  const headers = init.headers
  if (headers instanceof Headers) {
    return headers.get('Authorization')
  }
  const record = headers as Record<string, string>
  return record.Authorization ?? null
}

function findPostLikeAuthHeader(): string | null {
  for (const [input, init] of mockedFetch.mock.calls) {
    const url = typeof input === 'string' ? input : input.toString()
    if (!url.includes('/api/like') || url.includes('/user')) continue
    const method = (init as RequestInit | undefined)?.method ?? 'GET'
    if (method !== 'POST') continue
    return getAuthorizationHeader(init as RequestInit)
  }
  return null
}

describe('useLike', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSiweStore.setState({ jwtToken: null })
    mockedFetch.mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/like/user')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, proposalId, reactions: [] }),
        } as Response)
      }
      if (url.includes('/api/like') && !url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          json: async () => defaultLikeCounts,
        } as Response)
      }
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('when JWT is expired, calls signOut and signIn before fetching user reaction; does not call /api/like/user with the expired Bearer token before signIn resolves', async () => {
    const expiredJwt = jwtExpiringIn(-120)
    const freshJwt = jwtExpiringIn(3600)
    useSiweStore.setState({ jwtToken: expiredJwt })

    let releaseSignIn!: (token: string | null) => void
    const signInPromise = new Promise<string | null>(resolve => {
      releaseSignIn = resolve
    })
    const signIn = vi.fn(() => signInPromise)

    const { result } = renderHook(
      () => useLike(proposalId, true, signIn),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      void result.current.toggleLike()
      await Promise.resolve()
    })

    expect(siweTestCtx.signOutSpy).toHaveBeenCalledTimes(1)
    expect(signIn).toHaveBeenCalledTimes(1)

    const userCallsBeforeRelease = mockedFetch.mock.calls.filter(([u]) =>
      String(u).includes('/api/like/user'),
    )
    for (const [, init] of userCallsBeforeRelease) {
      const auth =
        init && typeof init === 'object' && 'headers' in init
          ? new Headers(init.headers as HeadersInit).get('Authorization')
          : null
      expect(auth).not.toBe(`Bearer ${expiredJwt}`)
    }

    await act(async () => {
      releaseSignIn!(freshJwt)
      await Promise.resolve()
    })

    await waitFor(() => {
      const auths = mockedFetch.mock.calls
        .filter(([u]) => String(u).includes('/api/like/user'))
        .map(([, init]) =>
          init && typeof init === 'object' && 'headers' in init
            ? new Headers(init.headers as HeadersInit).get('Authorization')
            : null,
        )
      expect(auths.some(a => a === `Bearer ${freshJwt}`)).toBe(true)
    })
  })

  it('when JWT is valid, does not call signIn and completes the like flow', async () => {
    const validJwt = jwtExpiringIn(3600)
    useSiweStore.setState({ jwtToken: validJwt })
    const signIn = vi.fn()

    mockedFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = init?.method ?? 'GET'
      if (url.includes('/api/like/user')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, proposalId, reactions: [] }),
        } as Response)
      }
      if (url.includes('/api/like') && method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, liked: true, reaction: 'heart' }),
        } as Response)
      }
      if (url.includes('/api/like')) {
        return Promise.resolve({
          ok: true,
          json: async () => defaultLikeCounts,
        } as Response)
      }
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
    })

    const { result } = renderHook(
      () => useLike(proposalId, true, signIn),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggleLike()
    })

    expect(signIn).not.toHaveBeenCalled()
    expect(findPostLikeAuthHeader()).toBe(`Bearer ${validJwt}`)
  })

  it('does not fetch /api/like/user from the user-reaction query when the persisted JWT is expired', async () => {
    const expiredJwt = jwtExpiringIn(-60)
    useSiweStore.setState({ jwtToken: expiredJwt })
    const signIn = vi.fn()

    const { result } = renderHook(() => useLike(proposalId, true, signIn), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const userFetches = mockedFetch.mock.calls.filter(([u]) => String(u).includes('/api/like/user'))
    expect(userFetches).toHaveLength(0)

    const publicLikeFetches = mockedFetch.mock.calls.filter(
      ([u]) => String(u).includes('/api/like') && !String(u).includes('/user'),
    )
    expect(publicLikeFetches.length).toBeGreaterThanOrEqual(1)
  })

  it('when signIn returns null (user reject), isToggling becomes false', async () => {
    useSiweStore.setState({ jwtToken: null })
    const signIn = vi.fn().mockResolvedValue(null)

    const { result } = renderHook(
      () => useLike(proposalId, true, signIn),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggleLike()
    })

    expect(signIn).toHaveBeenCalled()
    expect(result.current.isToggling).toBe(false)
  })

  it('on 401 from POST /api/like, calls signOut and shows session toast', async () => {
    const validJwt = jwtExpiringIn(3600)
    useSiweStore.setState({ jwtToken: validJwt })
    const signIn = vi.fn()

    mockedFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = init?.method ?? 'GET'
      if (url.includes('/api/like/user')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, proposalId, reactions: [] }),
        } as Response)
      }
      if (url.includes('/api/like') && method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ success: false }),
        } as Response)
      }
      if (url.includes('/api/like')) {
        return Promise.resolve({
          ok: true,
          json: async () => defaultLikeCounts,
        } as Response)
      }
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
    })

    const { result } = renderHook(
      () => useLike(proposalId, true, signIn),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggleLike()
    })

    expect(siweTestCtx.signOutSpy).toHaveBeenCalled()
    expect(mockShowToast).toHaveBeenCalledWith({
      severity: 'error',
      title: 'Session expired',
      content: 'Please sign in again to like this proposal.',
    })
    expect(result.current.isToggling).toBe(false)
  })
})
