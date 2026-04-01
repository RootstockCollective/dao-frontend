import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, it, expect, vi } from 'vitest'

import { RequestStatusStepper } from './RequestStatusStepper'

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

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

  it('renders deposit stages with "Shares claimed" as final label', () => {
    render(<RequestStatusStepper status="pending" type="deposit" />)
    expect(screen.getByText('Shares claimed')).toBeInTheDocument()
    expect(screen.queryByText('Redeemed')).not.toBeInTheDocument()
  })

  it('renders proposal-style > separators between stages', () => {
    render(<RequestStatusStepper status="pending" type="withdrawal" />)
    const stepper = screen.getByTestId('progress-stepper')
    const separators = stepper.querySelectorAll('[aria-hidden="true"]')
    expect(separators).toHaveLength(3)
    separators.forEach((el) => {
      expect(el.textContent).toBe('>')
    })
  })

  it('highlights stage 2 for pending status', () => {
    render(<RequestStatusStepper status="pending" type="withdrawal" />)
    const stage2 = screen.getByText('Pending')
    expect(stage2).toHaveClass('text-text-100')
    expect(screen.getByText('Submitted')).toHaveClass('text-bg-0')
  })

  it('highlights stage 3 for claimable status', () => {
    render(<RequestStatusStepper status="claimable" type="withdrawal" />)
    const stage3 = screen.getByText('Approved')
    expect(stage3).toHaveClass('text-text-100')
  })

  it('highlights stage 4 for done status', () => {
    render(<RequestStatusStepper status="done" type="withdrawal" />)
    const stage4 = screen.getByText('Redeemed')
    expect(stage4).toHaveClass('text-text-100')
  })

  it('renders nothing for failed status', () => {
    const { container } = render(<RequestStatusStepper status="failed" type="deposit" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders cancelled stages with "Cancelled by user" as final label', () => {
    render(<RequestStatusStepper status="cancelled" type="deposit" />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Cancelled by user')).toBeInTheDocument()
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
  })

  it('highlights stage 3 (Approved) when displayStatus is approved', () => {
    render(<RequestStatusStepper status="pending" type="withdrawal" displayStatus="approved" />)
    const stage3 = screen.getByText('Approved')
    expect(stage3).toHaveClass('text-text-100')
    const stage2 = screen.getByText('Pending')
    expect(stage2).toHaveClass('text-bg-0')
  })

  it('renders cancelled stages for withdrawal type too', () => {
    render(<RequestStatusStepper status="cancelled" type="withdrawal" />)
    expect(screen.getByText('Cancelled by user')).toBeInTheDocument()
    expect(screen.queryByText('Redeemed')).not.toBeInTheDocument()
  })

  it('highlights final stage for cancelled status', () => {
    render(<RequestStatusStepper status="cancelled" type="deposit" />)
    const stage3 = screen.getByText('Cancelled by user')
    expect(stage3).toHaveClass('text-text-100')
  })

  it('renders 2 > separators for cancelled 3-stage flow', () => {
    render(<RequestStatusStepper status="cancelled" type="deposit" />)
    const stepper = screen.getByTestId('progress-stepper')
    const separators = stepper.querySelectorAll('[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
  })
})
