import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CollectivePossibilities } from './CollectivePossibilities'

vi.mock('@/shared/walletConnection/connection/ConnectWorkflow', () => ({
  ConnectWorkflow: () => <button type="button">Connect wallet</button>,
}))

describe('CollectivePossibilities', () => {
  beforeEach(() => {
    // jsdom does not implement media playback, and the logo starts its video on mount
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the three possibilities, the animated logo and the connect action', () => {
    render(<CollectivePossibilities />)

    expect(screen.getByText("Don't miss")).toBeInTheDocument()
    expect(screen.getByTestId('PossibilitiesTile')).toContainElement(screen.getByTestId('MotionLogoVideo'))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Connect wallet')).toBeInTheDocument()
  })

  it('names the region after its title', () => {
    render(<CollectivePossibilities />)

    expect(screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })).toBeInTheDocument()
  })

  it('hides the card when dismissed, without persisting the choice', () => {
    render(<CollectivePossibilities />)

    fireEvent.click(screen.getByTestId('DismissPossibilitiesButton'))

    expect(screen.queryByTestId('CollectivePossibilities')).not.toBeInTheDocument()
    expect(Object.keys(localStorage)).toHaveLength(0)
  })

  it('comes back on the next page load', () => {
    const { unmount } = render(<CollectivePossibilities />)
    fireEvent.click(screen.getByTestId('DismissPossibilitiesButton'))
    unmount()

    render(<CollectivePossibilities />)
    expect(screen.getByTestId('CollectivePossibilities')).toBeInTheDocument()
  })
})
