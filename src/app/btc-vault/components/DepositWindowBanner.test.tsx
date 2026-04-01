import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'

import { DepositWindowBanner } from './DepositWindowBanner'

const mockUseEpochState = vi.fn()

vi.mock('../hooks/useEpochState', () => ({
  useEpochState: () => mockUseEpochState(),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/app/backing/components/DecorativeSquares', () => ({
  DecorativeSquares: () => null,
}))

vi.mock('@/components/Countdown/Countdown', () => ({
  Countdown: () => <span data-testid="countdown">5d 23h 59m</span>,
}))

describe('DepositWindowBanner', () => {
  const openEpoch = {
    epochId: '1',
    status: 'open' as const,
    statusSummary: 'Closes in 5d',
    isAcceptingRequests: true,
    endTime: Math.floor(new Date('2025-02-23T00:00:00.000Z').getTime() / 1000),
    closesAtFormatted: '23 Feb 2025',
  }

  beforeEach(() => {
    mockUseEpochState.mockReturnValue({ data: openEpoch })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows banner with deposit window title, subtitle, and countdown when epoch is open', () => {
    render(<DepositWindowBanner />)

    expect(screen.getByTestId('DepositWindowBanner')).toBeInTheDocument()
    expect(screen.getByText(/DEPOSIT WINDOW 1/)).toBeInTheDocument()
    expect(
      screen.getByText(/For the current cycle, deposits can be made until February 23\./),
    ).toBeInTheDocument()
    expect(screen.getByTestId('countdown')).toHaveTextContent('5d 23h 59m')
  })

  it('returns null when epoch is not accepting requests', () => {
    mockUseEpochState.mockReturnValue({
      data: { ...openEpoch, isAcceptingRequests: false, status: 'closed' as const },
    })
    render(<DepositWindowBanner />)

    expect(screen.queryByTestId('DepositWindowBanner')).not.toBeInTheDocument()
  })

  it('returns null when epoch data is undefined', () => {
    mockUseEpochState.mockReturnValue({ data: undefined })
    render(<DepositWindowBanner />)

    expect(screen.queryByTestId('DepositWindowBanner')).not.toBeInTheDocument()
  })

  it('returns null when endTime is missing', () => {
    mockUseEpochState.mockReturnValue({
      data: { ...openEpoch, endTime: undefined as unknown as number },
    })
    render(<DepositWindowBanner />)

    expect(screen.queryByTestId('DepositWindowBanner')).not.toBeInTheDocument()
  })
})
