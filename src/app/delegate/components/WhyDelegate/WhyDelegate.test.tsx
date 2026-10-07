import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { WhyDelegate } from './WhyDelegate'

describe('WhyDelegate', () => {
  afterEach(cleanup)

  it('starts open, showing the four reasons', () => {
    render(<WhyDelegate />)

    const toggle = screen.getByTestId('WhyDelegateToggle')
    expect(toggle).toHaveTextContent('Delegate your voting power')
    expect(toggle).toHaveTextContent('Hide')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'How delegation works' })).toHaveAttribute('target', '_blank')
  })

  it('collapses on click to the heading row, and opens again', () => {
    render(<WhyDelegate />)
    const toggle = screen.getByTestId('WhyDelegateToggle')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveTextContent('Why delegate')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('only points aria-controls at the panel while the panel is rendered', () => {
    render(<WhyDelegate />)
    const toggle = screen.getByTestId('WhyDelegateToggle')

    const panelId = toggle.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(document.getElementById(panelId!)).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(toggle).not.toHaveAttribute('aria-controls')
  })

  it('starts open on every visit, whatever was collapsed before', () => {
    const { unmount } = render(<WhyDelegate />)
    fireEvent.click(screen.getByTestId('WhyDelegateToggle'))
    unmount()

    render(<WhyDelegate />)

    expect(screen.getByTestId('WhyDelegateToggle')).toHaveAttribute('aria-expanded', 'true')
  })
})
