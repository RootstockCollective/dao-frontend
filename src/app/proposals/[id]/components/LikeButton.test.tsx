import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { encodeUnsignedJwtForTests } from '../encodeUnsignedJwtForTests'

import { LikeButton } from './LikeButton'
import { SiweTooltipContent } from './SiweTooltipContent'

vi.mock('@/shared/notification', () => ({
  showToast: vi.fn(),
}))

import { showToast } from '@/shared/notification'

const mockShowToast = vi.mocked(showToast)

const signInMockState = {
  error: null as Error | null,
  isAuthenticated: false,
  isLoading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
}

vi.mock('@/shared/hooks/useSignIn', () => ({
  useSignIn: () => ({
    signIn: signInMockState.signIn,
    isLoading: signInMockState.isLoading,
    error: signInMockState.error,
    isAuthenticated: signInMockState.isAuthenticated,
    signOut: signInMockState.signOut,
  }),
}))

vi.mock('@/shared/walletConnection/connection/useAppKitFlow', () => ({
  useAppKitFlow: () => ({ onConnectWalletButtonClick: vi.fn() }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: true }),
}))

vi.mock('@/lib/auth/siweStore', async () => {
  const { create: createStore } = await import('zustand')
  const useSiweStore = createStore<{ jwtToken: string | null; signOut: () => void }>(set => ({
    jwtToken: null,
    signOut: () => set({ jwtToken: null }),
  }))
  return { useSiweStore }
})

import { useSiweStore } from '@/lib/auth/siweStore'

const originalFetch = globalThis.fetch

function proposalIdFromRequest(input: RequestInfo | URL, init?: RequestInit): string {
  const url = typeof input === 'string' ? input : input.toString()
  if (url.includes('proposalId=')) {
    return new URL(url, 'http://localhost').searchParams.get('proposalId') ?? 'p0'
  }
  if (init?.body && typeof init.body === 'string') {
    try {
      const body = JSON.parse(init.body) as { proposalId?: string }
      return body.proposalId ?? 'p0'
    } catch {
      return 'p0'
    }
  }
  return 'p0'
}

function installLikeApiFetchMock() {
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const method = init?.method ?? 'GET'
    const pid = proposalIdFromRequest(input, init)

    if (url.includes('/api/like/user')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, proposalId: pid, reactions: [] }),
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
        json: async () => ({
          success: true,
          proposalId: pid,
          reactions: { heart: 1 },
        }),
      } as Response)
    }
    return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
  }) as typeof fetch
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signInMockState.error = null
    signInMockState.isAuthenticated = false
    signInMockState.isLoading = false
    signInMockState.signIn.mockReset()
    useSiweStore.setState({ jwtToken: null })
    installLikeApiFetchMock()
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
  })

  it('should show a toast when useSignIn reports an error', () => {
    signInMockState.error = new Error('User rejected the request')
    render(<LikeButton proposalId="p1" />, { wrapper })

    expect(mockShowToast).toHaveBeenCalledTimes(1)
    expect(mockShowToast).toHaveBeenCalledWith({
      severity: 'error',
      title: 'Sign-in failed',
      content: 'User rejected the request',
    })
  })

  it('should not repeat the same auth error toast on re-render', () => {
    signInMockState.error = new Error('Challenge request failed')
    const { rerender } = render(<LikeButton proposalId="p1" />, { wrapper })
    expect(mockShowToast).toHaveBeenCalledTimes(1)

    rerender(<LikeButton proposalId="p1" />)
    expect(mockShowToast).toHaveBeenCalledTimes(1)
  })

  it('should toast again after the error clears and the same message returns', () => {
    signInMockState.error = new Error('Login failed')
    const { rerender } = render(<LikeButton proposalId="p1" />, { wrapper })
    expect(mockShowToast).toHaveBeenCalledTimes(1)

    signInMockState.error = null
    rerender(<LikeButton proposalId="p1" />)

    signInMockState.error = new Error('Login failed')
    rerender(<LikeButton proposalId="p1" />)
    expect(mockShowToast).toHaveBeenCalledTimes(2)
  })

  it('should invoke signIn when the wallet is connected but the user is not SIWE-authenticated', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const freshJwt = encodeUnsignedJwtForTests({
      exp,
      userAddress: '0x0000000000000000000000000000000000000002',
    })
    signInMockState.signIn.mockResolvedValue(freshJwt)

    const user = userEvent.setup()
    const { container } = render(<LikeButton proposalId="p-integration" />, { wrapper })
    const likeButton = within(container).getByRole('button', { name: /like proposal/i })

    await waitFor(() => expect(likeButton).toHaveTextContent('1'))

    await user.click(likeButton)

    expect(signInMockState.signIn).toHaveBeenCalledTimes(1)
  })
})

describe('SiweTooltipContent', () => {
  it('should show inline error copy when error is set', () => {
    render(<SiweTooltipContent onClick={vi.fn()} error={new Error('Wallet not connected')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Wallet not connected')
  })
})
