import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

import type { ActiveRequestDisplay } from '../../services/ui/types'

vi.mock('@/components/ProgressBarNew', async (importOriginal) => {
  const React = require('react')
  const actual = await importOriginal<typeof import('@/components/ProgressBarNew')>()
  return {
    ...actual,
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

import { ActiveRequestSection } from './ActiveRequestSection'

const MOCK_REQUEST: ActiveRequestDisplay = {
  id: 'req-1',
  type: 'deposit',
  amountFormatted: '0.5',
  status: 'pending',
  createdAtFormatted: '14 Nov 2023',
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

  it('renders nothing when data is undefined', () => {
    const { container } = render(<ActiveRequestSection data={undefined} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when there are no active requests', () => {
    const { container } = render(<ActiveRequestSection data={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders RequestProcessingBlock when user has an active request', () => {
    render(<ActiveRequestSection data={[MOCK_REQUEST]} />)

    expect(screen.getByTestId('btc-vault-active-request')).toBeInTheDocument()
    expect(screen.getByTestId('request-processing-block')).toBeInTheDocument()
  })

  it('renders inside a SectionContainer with REQUEST PROCESSING title', () => {
    render(<ActiveRequestSection data={[MOCK_REQUEST]} />)

    expect(screen.getAllByText('REQUEST PROCESSING').length).toBeGreaterThan(0)
  })
})
