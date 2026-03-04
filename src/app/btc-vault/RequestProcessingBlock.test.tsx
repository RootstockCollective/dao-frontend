import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { RequestProcessingBlock } from './components/RequestProcessingBlock'
import type { ActiveRequestDisplay } from './services/ui/types'

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

function getBlock(container: HTMLElement) {
  return container.querySelector('[data-testid="request-processing-block"]') as HTMLElement
}

function makeRequest(overrides: Partial<ActiveRequestDisplay> = {}): ActiveRequestDisplay {
  return {
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
    ...overrides,
  }
}

describe('RequestProcessingBlock', () => {
  it('renders four stage labels', () => {
    const { container } = render(<RequestProcessingBlock request={makeRequest()} />)
    const block = getBlock(container)
    expect(within(block).getByText('Submitted')).toBeInTheDocument()
    expect(within(block).getByText('Pending')).toBeInTheDocument()
    expect(within(block).getByText('Approved')).toBeInTheDocument()
    expect(within(block).getByText('Successful')).toBeInTheDocument()
  })

  it('renders progress bar', () => {
    const { container } = render(<RequestProcessingBlock request={makeRequest()} />)
    const block = getBlock(container)
    expect(within(block).getByTestId('progress-bar')).toBeInTheDocument()
  })

  it('renders request details grid', () => {
    const { container } = render(
      <RequestProcessingBlock
        request={makeRequest({
          type: 'withdrawal',
          amountFormatted: '1.25',
          sharesFormatted: '1.25',
          lastUpdatedFormatted: '21 May 2025',
        })}
      />,
    )
    const block = getBlock(container)
    expect(within(block).getByText('Withdrawal')).toBeInTheDocument()
    expect(within(block).getAllByText('1.25').length).toBeGreaterThanOrEqual(1)
    expect(within(block).getByText('21 May 2025')).toBeInTheDocument()
  })

  it('renders View requests history link with correct href', () => {
    const { container } = render(<RequestProcessingBlock request={makeRequest()} />)
    const block = getBlock(container)
    const link = block?.querySelector('a[href="/btc-vault/request-history"]')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent(/view requests history/i)
  })

  it('shows USD equivalent when provided', () => {
    const { container } = render(
      <RequestProcessingBlock
        request={makeRequest({ usdEquivalentFormatted: '$42,000' })}
      />,
    )
    const block = getBlock(container)
    expect(within(block).getByText('$42,000')).toBeInTheDocument()
  })
})
