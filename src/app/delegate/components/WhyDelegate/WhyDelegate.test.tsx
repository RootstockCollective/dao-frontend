import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { WHY_DELEGATE_STORAGE_KEY, WhyDelegate } from './WhyDelegate'

describe('WhyDelegate', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders the four reasons expanded by default', () => {
    render(<WhyDelegate />)

    expect(screen.getByText(/Delegate your voting power/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'How delegation works' })).toHaveAttribute('target', '_blank')
    expect(screen.getByTestId('WhyDelegateToggle')).toHaveAccessibleName('Hide')
  })

  it('collapses the reasons and persists the choice', () => {
    render(<WhyDelegate />)

    fireEvent.click(screen.getByTestId('WhyDelegateToggle'))

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByTestId('WhyDelegateToggle')).toHaveAccessibleName('Show')
    expect(localStorage.getItem(WHY_DELEGATE_STORAGE_KEY)).toBe('false')
  })

  it('starts collapsed when it was collapsed before', () => {
    localStorage.setItem(WHY_DELEGATE_STORAGE_KEY, 'false')

    render(<WhyDelegate />)

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
