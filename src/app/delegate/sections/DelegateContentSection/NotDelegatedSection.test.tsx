import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotDelegatedSection } from './NotDelegatedSection'

const renderSection = ({ isDelegatingToSelf = false, isChoosingDelegate = false } = {}) => {
  const onDelegateToSelf = vi.fn()
  const onToggleDelegates = vi.fn()
  render(
    <NotDelegatedSection
      isDelegatingToSelf={isDelegatingToSelf}
      onDelegateToSelf={onDelegateToSelf}
      isChoosingDelegate={isChoosingDelegate}
      onToggleDelegates={onToggleDelegates}
    />,
  )
  return {
    onDelegateToSelf,
    onToggleDelegates,
    delegateToSelfButton: screen.getByTestId('NotDelegatedButton'),
    chooseDelegateButton: screen.getByTestId('ChooseDelegateButton'),
  }
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
    const { delegateToSelfButton, onDelegateToSelf, onToggleDelegates } = renderSection()

    expect(delegateToSelfButton).toHaveTextContent('Delegate to myself')
    fireEvent.click(delegateToSelfButton)

    expect(onDelegateToSelf).toHaveBeenCalledTimes(1)
    expect(onToggleDelegates).not.toHaveBeenCalled()
  })

  it('unfolds the delegates list to choose someone else', () => {
    const { chooseDelegateButton, onDelegateToSelf, onToggleDelegates } = renderSection()

    expect(chooseDelegateButton).toHaveTextContent('Choose a delegate')
    expect(chooseDelegateButton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(chooseDelegateButton)

    expect(onToggleDelegates).toHaveBeenCalledTimes(1)
    expect(onDelegateToSelf).not.toHaveBeenCalled()
  })

  it('folds the list again from the same button once it is open', () => {
    const { chooseDelegateButton, onToggleDelegates } = renderSection({ isChoosingDelegate: true })

    expect(chooseDelegateButton).toHaveTextContent('Hide delegates')
    expect(chooseDelegateButton).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(chooseDelegateButton)

    expect(onToggleDelegates).toHaveBeenCalledTimes(1)
  })

  it('takes no other action while delegating to themselves', () => {
    const { delegateToSelfButton, chooseDelegateButton, onDelegateToSelf, onToggleDelegates } = renderSection(
      {
        isDelegatingToSelf: true,
      },
    )

    expect(delegateToSelfButton).toHaveTextContent('Delegating...')
    expect(delegateToSelfButton).toBeDisabled()
    expect(chooseDelegateButton).toBeDisabled()
    fireEvent.click(delegateToSelfButton)
    fireEvent.click(chooseDelegateButton)

    expect(onDelegateToSelf).not.toHaveBeenCalled()
    expect(onToggleDelegates).not.toHaveBeenCalled()
  })
})
