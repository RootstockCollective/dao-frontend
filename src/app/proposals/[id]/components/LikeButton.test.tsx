import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const toggleLike = vi.fn()
vi.mock('../hooks/useLike', () => ({
  useLike: () => ({
    count: 2,
    liked: false,
    isLoading: false,
    isToggling: false,
    toggleLike,
  }),
}))

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
  })

  it('shows a toast when useSignIn reports an error', () => {
    signInMockState.error = new Error('User rejected the request')
    render(<LikeButton proposalId="p1" />, { wrapper })

    expect(mockShowToast).toHaveBeenCalledTimes(1)
    expect(mockShowToast).toHaveBeenCalledWith({
      severity: 'error',
      title: 'Sign-in failed',
      content: 'User rejected the request',
    })
  })

  it('does not repeat the same auth error toast on re-render', () => {
    signInMockState.error = new Error('Challenge request failed')
    const { rerender } = render(<LikeButton proposalId="p1" />, { wrapper })
    expect(mockShowToast).toHaveBeenCalledTimes(1)

    rerender(<LikeButton proposalId="p1" />)
    expect(mockShowToast).toHaveBeenCalledTimes(1)
  })

  it('toasts again after the error clears and the same message returns', () => {
    signInMockState.error = new Error('Login failed')
    const { rerender } = render(<LikeButton proposalId="p1" />, { wrapper })
    expect(mockShowToast).toHaveBeenCalledTimes(1)

    signInMockState.error = null
    rerender(<LikeButton proposalId="p1" />)

    signInMockState.error = new Error('Login failed')
    rerender(<LikeButton proposalId="p1" />)
    expect(mockShowToast).toHaveBeenCalledTimes(2)
  })
})

describe('SiweTooltipContent', () => {
  it('shows inline error copy when error is set', () => {
    render(<SiweTooltipContent onClick={vi.fn()} error={new Error('Wallet not connected')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Wallet not connected')
  })
})
