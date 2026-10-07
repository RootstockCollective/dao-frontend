import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('posthog-js', () => ({ default: { reset: vi.fn(), register: vi.fn() } }))

import { useSiweStore } from '@/lib/auth/siweStore'

import { useLike } from './useLike'

const PROPOSAL_ID = '1'
const SESSION = { userAddress: '0xabcdef0123456789abcdef0123456789abcdef01', expiresAt: Date.now() + 60_000 }

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

function mockFetch({ likeStatus = 200 } = {}) {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.startsWith('/api/like/user')) {
      return json({ success: true, proposalId: PROPOSAL_ID, reactions: [] })
    }
    if (url === '/api/like' && init?.method === 'POST') {
      return likeStatus === 200
        ? json({ success: true, liked: true, reaction: 'heart' })
        : json({ error: 'Unauthorized' }, likeStatus)
    }
    return json({ success: true, proposalId: PROPOSAL_ID, reactions: { heart: 0 } })
  })
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const hasAuthorizationHeader = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls.some(([, init]) => new Headers(init?.headers).has('Authorization'))

describe('useLike', () => {
  beforeEach(() => {
    localStorage.clear()
    useSiweStore.setState({ session: null, isLoading: false, error: null })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('signs in first and then likes with the session cookie only', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)
    const signIn = vi.fn(async () => {
      useSiweStore.getState().setSession(SESSION)
      return true
    })
    const { result } = renderHook(() => useLike(PROPOSAL_ID, true, signIn), { wrapper: createWrapper() })

    await act(() => result.current.toggleLike())

    expect(signIn).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith('/api/like', expect.objectContaining({ method: 'POST' }))
    expect(hasAuthorizationHeader(fetchMock)).toBe(false)
    await waitFor(() => expect(result.current.liked).toBe(true))
  })

  it('forgets the session when the server rejects the cookie', async () => {
    useSiweStore.getState().setSession(SESSION)
    vi.stubGlobal('fetch', mockFetch({ likeStatus: 401 }))
    const signIn = vi.fn(async () => true)
    const { result } = renderHook(() => useLike(PROPOSAL_ID, true, signIn), { wrapper: createWrapper() })

    await act(() => result.current.toggleLike())

    expect(signIn).not.toHaveBeenCalled()
    expect(useSiweStore.getState().session).toBeNull()
    expect(result.current.liked).toBe(false)
  })
})
