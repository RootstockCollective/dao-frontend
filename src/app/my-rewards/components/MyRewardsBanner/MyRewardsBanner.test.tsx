import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MyRewardsBanner } from './MyRewardsBanner'

describe('MyRewardsBanner', () => {
  afterEach(cleanup)

  it('renders the title, the intro copy and the whitepaper link', () => {
    render(<MyRewardsBanner />)

    expect(screen.getByText('My Rewards')).toBeInTheDocument()
    expect(screen.getByText(/Track and claim the rewards you earn/)).toBeInTheDocument()
    expect(screen.getByTestId('whitepaper-link')).toBeInTheDocument()
  })

  it('hides the banner when dismissed, without persisting the choice', () => {
    render(<MyRewardsBanner />)

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByTestId('MyRewardsBanner')).not.toBeInTheDocument()
    expect(Object.keys(localStorage)).toHaveLength(0)
  })

  it('comes back on the next page load', () => {
    const { unmount } = render(<MyRewardsBanner />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    unmount()

    render(<MyRewardsBanner />)
    expect(screen.getByTestId('MyRewardsBanner')).toBeInTheDocument()
  })
})
