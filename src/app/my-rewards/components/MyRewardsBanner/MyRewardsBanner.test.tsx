import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { currentLinks } from '@/lib/links'

import { MyRewardsBanner } from './MyRewardsBanner'

describe('MyRewardsBanner', () => {
  afterEach(cleanup)

  it('renders the title, the intro copy and the whitepaper link', () => {
    render(<MyRewardsBanner />)

    expect(screen.getByText('My Rewards')).toBeInTheDocument()
    expect(screen.getByText(/Track and claim the rewards you earn/)).toBeInTheDocument()
    expect(screen.getByTestId('whitepaper-link')).toBeInTheDocument()
  })

  it('links to the Collective Rewards whitepaper configured in currentLinks', () => {
    render(<MyRewardsBanner />)

    expect(screen.getByTestId('whitepaper-link')).toHaveAttribute('href', currentLinks.rewardsWhitepaper)
  })
})
