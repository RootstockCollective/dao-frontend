import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { HOW_A_PROPOSAL_WORKS_STORAGE_KEY, HowAProposalWorks } from './HowAProposalWorks'

describe('HowAProposalWorks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders the six steps expanded by default', () => {
    render(<HowAProposalWorks />)

    expect(screen.getByText('How a proposal works')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByTestId('HowAProposalWorksToggle')).toHaveAccessibleName('Hide')
  })

  it('collapses the steps and persists the choice', () => {
    render(<HowAProposalWorks />)

    fireEvent.click(screen.getByTestId('HowAProposalWorksToggle'))

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByTestId('HowAProposalWorksToggle')).toHaveAccessibleName('Show')
    expect(localStorage.getItem(HOW_A_PROPOSAL_WORKS_STORAGE_KEY)).toBe('false')
  })

  it('starts collapsed when it was collapsed before', () => {
    localStorage.setItem(HOW_A_PROPOSAL_WORKS_STORAGE_KEY, 'false')

    render(<HowAProposalWorks />)

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
