import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BuildersBanner } from './BuildersBanner'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('BuildersBanner', () => {
  beforeEach(() => {
    push.mockClear()
  })

  afterEach(cleanup)

  it('renders the eyebrow, the title and both calls to action', () => {
    render(<BuildersBanner />)

    expect(screen.getByText('Build on Rootstock')).toBeInTheDocument()
    expect(screen.getByText('Builders')).toBeInTheDocument()
    expect(screen.getByTestId('JoinBuilderRewardsButton')).toBeInTheDocument()
    expect(screen.getByTestId('ApplyForGrantButton')).toBeInTheDocument()
  })

  it('routes each call to action to its proposal type', () => {
    render(<BuildersBanner />)

    fireEvent.click(screen.getByTestId('JoinBuilderRewardsButton'))
    expect(push).toHaveBeenCalledWith('/proposals/new?type=Builder')

    fireEvent.click(screen.getByTestId('ApplyForGrantButton'))
    expect(push).toHaveBeenCalledWith('/proposals/new?type=Grants')
  })

  it('hides the banner when dismissed, without persisting the choice', () => {
    render(<BuildersBanner />)

    fireEvent.click(screen.getByTestId('DismissBannerButton'))

    expect(screen.queryByTestId('BuildersBanner')).not.toBeInTheDocument()
    expect(Object.keys(localStorage)).toHaveLength(0)
  })
})
