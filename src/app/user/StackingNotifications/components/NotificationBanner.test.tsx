import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotificationBanner } from './NotificationBanner'

const defaultProps = {
  title: 'Cycle just ended',
  description: 'Claim your rewards and re-stake them to earn more next cycle.',
  onDismiss: vi.fn(),
}

describe('NotificationBanner', () => {
  afterEach(cleanup)

  it('renders the copy and the call to action', () => {
    const buttonOnClick = vi.fn()
    render(<NotificationBanner {...defaultProps} buttonText="Claim Rewards" buttonOnClick={buttonOnClick} />)

    expect(screen.getByText('Cycle just ended')).toBeInTheDocument()
    expect(
      screen.getByText('Claim your rewards and re-stake them to earn more next cycle.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText('Claim Rewards'))
    expect(buttonOnClick).toHaveBeenCalledOnce()
  })

  it('clamps the copy instead of truncating it, and keeps the full text in the title', () => {
    render(<NotificationBanner {...defaultProps} />)

    const description = screen.getByTestId('NotificationDescription')
    expect(description).toHaveClass('md:line-clamp-2')
    expect(description).not.toHaveClass('md:truncate')
    expect(description).toHaveAttribute('title', defaultProps.description)
  })

  it('calls onDismiss when the close button is clicked', () => {
    const onDismiss = vi.fn()
    render(<NotificationBanner {...defaultProps} onDismiss={onDismiss} />)

    fireEvent.click(screen.getByTestId('DismissNotificationButton'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('falls back to the ember streaks when it has no artwork', () => {
    const { container, rerender } = render(<NotificationBanner {...defaultProps} />)
    expect(screen.getByTestId('NotificationStreaks')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()

    rerender(<NotificationBanner {...defaultProps} backgroundSrc="/images/notification-back.webp" />)
    expect(screen.queryByTestId('NotificationStreaks')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toBeInTheDocument()
  })
})
