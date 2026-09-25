import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { WhyDelegate } from './WhyDelegate'

describe('WhyDelegate', () => {
  afterEach(cleanup)

  it('starts collapsed, with only the heading row showing', () => {
    render(<WhyDelegate />)

    const toggle = screen.getByTestId('WhyDelegateToggle')
    expect(toggle).toHaveTextContent('Delegate your voting power')
    expect(toggle).toHaveTextContent('Why delegate')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('opens on click, showing the four reasons, and closes again', () => {
    render(<WhyDelegate />)
    const toggle = screen.getByTestId('WhyDelegateToggle')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveTextContent('Hide')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'How delegation works' })).toHaveAttribute('target', '_blank')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('only points aria-controls at the panel while the panel is rendered', () => {
    render(<WhyDelegate />)
    const toggle = screen.getByTestId('WhyDelegateToggle')

    expect(toggle).not.toHaveAttribute('aria-controls')

    fireEvent.click(toggle)

    const panelId = toggle.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(document.getElementById(panelId!)).toBeInTheDocument()
  })

  it('starts collapsed on every visit, whatever was left open before', () => {
    const { unmount } = render(<WhyDelegate />)
    fireEvent.click(screen.getByTestId('WhyDelegateToggle'))
    unmount()

    render(<WhyDelegate />)

    expect(screen.getByTestId('WhyDelegateToggle')).toHaveAttribute('aria-expanded', 'false')
  })
})
