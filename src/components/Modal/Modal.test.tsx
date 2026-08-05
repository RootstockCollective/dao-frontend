import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Modal } from './Modal'

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // The repo's vitest setup does not enable testing-library's auto-cleanup, and this
  // component portals into document.body — without this, panels pile up across tests.
  afterEach(cleanup)

  describe('onEscape', () => {
    it('calls onEscape when Escape is pressed', () => {
      const onEscape = vi.fn()
      render(
        <Modal onClose={vi.fn()} onEscape={onEscape}>
          content
        </Modal>,
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onEscape).toHaveBeenCalledTimes(1)
    })

    it('does nothing on Escape when no handler is given', () => {
      const onClose = vi.fn()
      render(<Modal onClose={onClose}>content</Modal>)

      fireEvent.keyDown(document, { key: 'Escape' })

      // Existing modals must keep their current behaviour: Escape is not a close.
      expect(onClose).not.toHaveBeenCalled()
    })

    it('stops listening once unmounted', () => {
      const onEscape = vi.fn()
      const { unmount } = render(
        <Modal onClose={vi.fn()} onEscape={onEscape}>
          content
        </Modal>,
      )

      unmount()
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onEscape).not.toHaveBeenCalled()
    })
  })

  describe('dialog semantics', () => {
    it('exposes a labelled dialog when focus is trapped', () => {
      render(
        <Modal onClose={vi.fn()} trapFocus ariaLabel="Staking onboarding">
          content
        </Modal>,
      )

      expect(screen.getByRole('dialog', { name: 'Staking onboarding' })).toBeDefined()
    })

    it('adds no dialog role by default', () => {
      render(<Modal onClose={vi.fn()}>content</Modal>)

      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  describe('focus trap', () => {
    it('wraps Tab from the last focusable back to the first', () => {
      render(
        <Modal onClose={vi.fn()} trapFocus>
          <button>first</button>
          <button>last</button>
        </Modal>,
      )

      const last = screen.getByText('last')
      last.focus()
      fireEvent.keyDown(document, { key: 'Tab' })

      // The close button is the first focusable inside the panel.
      expect(document.activeElement).toBe(screen.getByTestId('CloseButton'))
    })

    it('wraps Shift+Tab from the first focusable back to the last', () => {
      render(
        <Modal onClose={vi.fn()} trapFocus>
          <button>first</button>
          <button>last</button>
        </Modal>,
      )

      screen.getByTestId('CloseButton').focus()
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

      expect(document.activeElement).toBe(screen.getByText('last'))
    })

    it('leaves Tab alone in the middle of the sequence', () => {
      render(
        <Modal onClose={vi.fn()} trapFocus>
          <button>first</button>
          <button>last</button>
        </Modal>,
      )

      const first = screen.getByText('first')
      first.focus()
      fireEvent.keyDown(document, { key: 'Tab' })

      // Not at either end, so the browser's own tab order is left untouched.
      expect(document.activeElement).toBe(first)
    })

    // Clicking the backdrop moves focus to <body> without the user ever tabbing there. Only
    // Shift+Tab used to pull it back, so a forward Tab walked straight into the page behind.
    it('pulls focus back into the panel when Tab is pressed from outside it', () => {
      render(
        <Modal onClose={vi.fn()} trapFocus>
          <button>first</button>
          <button>last</button>
        </Modal>,
      )

      ;(document.activeElement as HTMLElement | null)?.blur()
      fireEvent.keyDown(document, { key: 'Tab' })

      // The close button is the panel's first focusable, so that is where a forward wrap lands.
      expect(document.activeElement).toBe(screen.getByTestId('CloseButton'))
    })

    it('restores focus to the trigger on unmount', () => {
      const trigger = document.createElement('button')
      document.body.appendChild(trigger)
      trigger.focus()

      const { unmount } = render(
        <Modal onClose={vi.fn()} trapFocus>
          <button>inside</button>
        </Modal>,
      )

      expect(document.activeElement).not.toBe(trigger)

      unmount()

      expect(document.activeElement).toBe(trigger)
      trigger.remove()
    })

    it('does not trap Tab when the prop is off', () => {
      render(
        <Modal onClose={vi.fn()}>
          <button>first</button>
          <button>last</button>
        </Modal>,
      )

      const last = screen.getByText('last')
      last.focus()
      fireEvent.keyDown(document, { key: 'Tab' })

      expect(document.activeElement).toBe(last)
    })
  })
})
