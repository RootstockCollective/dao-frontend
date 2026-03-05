import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'

import { RequestStatusStepper } from './RequestStatusStepper'

vi.mock('@/components/ProgressBarNew', () => ({
  ProgressBar: ({ progress }: { progress: number }) => (
    <div data-testid="progress-bar" data-progress={progress} />
  ),
}))

describe('RequestStatusStepper', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders withdrawal stages with "Redeemed" as final label', () => {
    render(<RequestStatusStepper status="pending" type="withdrawal" />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Redeemed')).toBeInTheDocument()
  })

  it('renders deposit stages with "Deposited" as final label', () => {
    render(<RequestStatusStepper status="pending" type="deposit" />)
    expect(screen.getByText('Deposited')).toBeInTheDocument()
    expect(screen.queryByText('Redeemed')).not.toBeInTheDocument()
  })

  it('highlights stage 2 for pending status', () => {
    render(<RequestStatusStepper status="pending" type="withdrawal" />)
    const stage2 = screen.getByText('Pending')
    expect(stage2).toHaveClass('font-semibold')
  })

  it('highlights stage 3 for claimable status', () => {
    render(<RequestStatusStepper status="claimable" type="withdrawal" />)
    const stage3 = screen.getByText('Approved')
    expect(stage3).toHaveClass('font-semibold')
  })

  it('highlights stage 4 for done status', () => {
    render(<RequestStatusStepper status="done" type="withdrawal" />)
    const stage4 = screen.getByText('Redeemed')
    expect(stage4).toHaveClass('font-semibold')
  })

  it('shows FAILED indicator for failed status', () => {
    render(<RequestStatusStepper status="failed" type="deposit" />)
    expect(screen.getByTestId('failed-indicator')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('does not show FAILED indicator for non-failed statuses', () => {
    render(<RequestStatusStepper status="done" type="deposit" />)
    expect(screen.queryByTestId('failed-indicator')).not.toBeInTheDocument()
  })
})
