import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { WHY_BECOME_A_BUILDER_STORAGE_KEY, WhyBecomeABuilder } from './WhyBecomeABuilder'

describe('WhyBecomeABuilder', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders the three perks expanded by default', () => {
    render(<WhyBecomeABuilder />)

    expect(screen.getByText('Why become a builder?')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.getByTestId('WhyBecomeABuilderToggle')).toHaveAccessibleName('Hide')
  })

  it('collapses the perks and persists the choice', () => {
    render(<WhyBecomeABuilder />)

    fireEvent.click(screen.getByTestId('WhyBecomeABuilderToggle'))

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByTestId('WhyBecomeABuilderToggle')).toHaveAccessibleName('Show')
    expect(localStorage.getItem(WHY_BECOME_A_BUILDER_STORAGE_KEY)).toBe('false')
  })

  it('starts collapsed when it was collapsed before', () => {
    localStorage.setItem(WHY_BECOME_A_BUILDER_STORAGE_KEY, 'false')

    render(<WhyBecomeABuilder />)

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
