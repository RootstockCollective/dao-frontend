import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { CancelRequestModal } from './CancelRequestModal'

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

describe('CancelRequestModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders title and description', () => {
    render(<CancelRequestModal onClose={onClose} onConfirm={onConfirm} />)
    expect(screen.getByText('Are you sure you want to cancel this request?')).toBeInTheDocument()
    expect(
      screen.getByText(
        "Canceling will stop this request and it won't be processed. You can submit a new request anytime.",
      ),
    ).toBeInTheDocument()
  })

  it('calls onClose when Nevermind is clicked', () => {
    render(<CancelRequestModal onClose={onClose} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('CancelRequestNevermind'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when "Yes, cancel" is clicked', () => {
    render(<CancelRequestModal onClose={onClose} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('CancelRequestConfirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows In Progress button when isLoading is true', () => {
    render(<CancelRequestModal onClose={onClose} onConfirm={onConfirm} isLoading />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.queryByTestId('CancelRequestConfirm')).not.toBeInTheDocument()
    expect(screen.getByTestId('CancelRequestNevermind')).toBeInTheDocument()
  })
})
