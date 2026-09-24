import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { COMMUNITIES_INTRO_STORAGE_KEY, CommunitiesIntro } from './CommunitiesIntro'

describe('CommunitiesIntro', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('explains the badges, expanded by default', () => {
    render(<CommunitiesIntro />)

    expect(screen.getByText(/Show your true colors/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByTestId('CommunitiesIntroToggle')).toHaveAccessibleName('Hide')
  })

  it('collapses and remembers it', () => {
    render(<CommunitiesIntro />)

    fireEvent.click(screen.getByTestId('CommunitiesIntroToggle'))

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(localStorage.getItem(COMMUNITIES_INTRO_STORAGE_KEY)).toBe('false')
  })
})
