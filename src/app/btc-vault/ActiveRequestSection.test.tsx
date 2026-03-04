import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

import type { ActiveRequestDisplay } from './services/ui/types'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('./hooks/useActiveRequests', () => ({
  useActiveRequests: vi.fn(),
}))

vi.mock('@/components/ProgressBarNew', () => {
  const React = require('react')
  return {
    ProgressBar: ({ progress }: { progress: number }) =>
      React.createElement('div', { 'data-testid': 'progress-bar', 'data-progress': progress }),
  }
})

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: unknown; href: string }) =>
    require('react').createElement('a', { href }, children),
}))

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

import { useAccount } from 'wagmi'
import { useActiveRequests } from './hooks/useActiveRequests'
import { ActiveRequestSection } from './ActiveRequestSection'

const mockedUseAccount = vi.mocked(useAccount)
const mockedUseActiveRequests = vi.mocked(useActiveRequests)

const MOCK_REQUEST: ActiveRequestDisplay = {
  id: 'req-1',
  type: 'deposit',
  amountFormatted: '0.5',
  status: 'pending',
  createdAtFormatted: 'Nov 14, 2023, 10:00 AM',
  claimable: false,
  lockedSharePriceFormatted: null,
  finalizeId: '1',
  epochId: '1',
  batchRedeemId: null,
  lastUpdatedFormatted: '14 Nov 2023',
  sharesFormatted: '—',
  usdEquivalentFormatted: null,
}

describe('ActiveRequestSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when wallet is not connected', () => {
    mockedUseAccount.mockReturnValue({ address: undefined } as unknown as ReturnType<typeof useAccount>)
    mockedUseActiveRequests.mockReturnValue({ data: undefined })

    const { container } = render(<ActiveRequestSection />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when there are no active requests', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as unknown as ReturnType<typeof useAccount>)
    mockedUseActiveRequests.mockReturnValue({ data: [] })

    const { container } = render(<ActiveRequestSection />)
    expect(container.innerHTML).toBe('')
  })

  it('renders RequestProcessingBlock when user has an active request', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as unknown as ReturnType<typeof useAccount>)
    mockedUseActiveRequests.mockReturnValue({ data: [MOCK_REQUEST] })

    render(<ActiveRequestSection />)

    expect(screen.getByTestId('btc-vault-active-request')).toBeInTheDocument()
    expect(screen.getByTestId('request-processing-block')).toBeInTheDocument()
  })

  it('renders inside a SectionContainer with ACTIVE REQUEST title', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as unknown as ReturnType<typeof useAccount>)
    mockedUseActiveRequests.mockReturnValue({ data: [MOCK_REQUEST] })

    render(<ActiveRequestSection />)

    expect(screen.getAllByText('ACTIVE REQUEST').length).toBeGreaterThan(0)
  })

  it('renders nothing when data is undefined (still loading)', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as unknown as ReturnType<typeof useAccount>)
    mockedUseActiveRequests.mockReturnValue({ data: undefined })

    const { container } = render(<ActiveRequestSection />)
    expect(container.innerHTML).toBe('')
  })
})
