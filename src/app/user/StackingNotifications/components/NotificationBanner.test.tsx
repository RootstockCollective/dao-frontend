import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotificationBanner } from './NotificationBanner'

const defaultProps = {
  title: 'CYCLE JUST ENDED',
  description: 'The cycle has ended.',
  backgroundSrc: '/images/notification-default.webp',
  onDismiss: vi.fn(),
}

describe('NotificationBanner', () => {
  afterEach(cleanup)

  it('renders the copy and the call to action', () => {
    const buttonOnClick = vi.fn()
    render(<NotificationBanner {...defaultProps} buttonText="Claim Rewards" buttonOnClick={buttonOnClick} />)

    expect(screen.getByText('CYCLE JUST ENDED')).toBeInTheDocument()
    expect(screen.getByText('The cycle has ended.')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Claim Rewards'))
    expect(buttonOnClick).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when the close button is clicked', () => {
    const onDismiss = vi.fn()
    render(<NotificationBanner {...defaultProps} onDismiss={onDismiss} />)

    fireEvent.click(screen.getByTestId('DismissNotificationButton'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('shows the decorative squares only when asked to', () => {
    const { rerender } = render(<NotificationBanner {...defaultProps} />)
    expect(screen.queryByLabelText('Decorative Squares')).not.toBeInTheDocument()

    rerender(<NotificationBanner {...defaultProps} showDecorativeSquares />)
    expect(screen.getByLabelText('Decorative Squares')).toBeInTheDocument()
  })
})
