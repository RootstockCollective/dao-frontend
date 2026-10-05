import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotDelegatedSection } from './NotDelegatedSection'

const renderSection = (isDelegatingToSelf = false) => {
  const onDelegateToSelf = vi.fn()
  render(<NotDelegatedSection isDelegatingToSelf={isDelegatingToSelf} onDelegateToSelf={onDelegateToSelf} />)
  return { onDelegateToSelf, button: screen.getByTestId('NotDelegatedButton') }
}

describe('NotDelegatedSection', () => {
  afterEach(cleanup)

  it('tells the holder they have not delegated yet', () => {
    renderSection()

    expect(screen.getByTestId('NotDelegatedSection')).toHaveTextContent(
      "You haven't delegated your voting power yet.",
    )
  })

  it('lets the holder delegate to themselves', () => {
    const { button, onDelegateToSelf } = renderSection()

    expect(button).toHaveTextContent('Delegate to myself')
    fireEvent.click(button)

    expect(onDelegateToSelf).toHaveBeenCalledTimes(1)
  })

  it('cannot delegate twice while the transaction is pending', () => {
    const { button, onDelegateToSelf } = renderSection(true)

    expect(button).toHaveTextContent('Delegating...')
    expect(button).toBeDisabled()
    fireEvent.click(button)

    expect(onDelegateToSelf).not.toHaveBeenCalled()
  })
})
