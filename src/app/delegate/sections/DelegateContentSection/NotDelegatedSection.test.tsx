import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotDelegatedSection } from './NotDelegatedSection'

const renderSection = (isDelegatingToSelf = false) => {
  const onDelegateToSelf = vi.fn()
  const onChooseDelegate = vi.fn()
  render(
    <NotDelegatedSection
      isDelegatingToSelf={isDelegatingToSelf}
      onDelegateToSelf={onDelegateToSelf}
      onChooseDelegate={onChooseDelegate}
    />,
  )
  return {
    onDelegateToSelf,
    onChooseDelegate,
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
    const { delegateToSelfButton, onDelegateToSelf, onChooseDelegate } = renderSection()

    expect(delegateToSelfButton).toHaveTextContent('Delegate to myself')
    fireEvent.click(delegateToSelfButton)

    expect(onDelegateToSelf).toHaveBeenCalledTimes(1)
    expect(onChooseDelegate).not.toHaveBeenCalled()
  })

  it('lets the holder choose someone else instead', () => {
    const { chooseDelegateButton, onDelegateToSelf, onChooseDelegate } = renderSection()

    expect(chooseDelegateButton).toHaveTextContent('Choose a delegate')
    fireEvent.click(chooseDelegateButton)

    expect(onChooseDelegate).toHaveBeenCalledTimes(1)
    expect(onDelegateToSelf).not.toHaveBeenCalled()
  })

  it('takes no other action while delegating to themselves', () => {
    const { delegateToSelfButton, chooseDelegateButton, onDelegateToSelf, onChooseDelegate } =
      renderSection(true)

    expect(delegateToSelfButton).toHaveTextContent('Delegating...')
    expect(delegateToSelfButton).toBeDisabled()
    expect(chooseDelegateButton).toBeDisabled()
    fireEvent.click(delegateToSelfButton)
    fireEvent.click(chooseDelegateButton)

    expect(onDelegateToSelf).not.toHaveBeenCalled()
    expect(onChooseDelegate).not.toHaveBeenCalled()
  })
})
