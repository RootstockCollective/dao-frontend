import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollapsibleStateScript, PersistedCollapsible } from './PersistedCollapsible'

const KEY = 'test-collapsible-open'

const Section = ({ defaultOpen }: { defaultOpen?: boolean }) => (
  <PersistedCollapsible
    storageKey={KEY}
    defaultOpen={defaultOpen}
    heading={<h3>Heading</h3>}
    data-testid="Section"
    toggleTestId="Toggle"
  >
    <ul>
      <li>One</li>
      <li>Two</li>
    </ul>
  </PersistedCollapsible>
)

/** Runs the pre-paint script the way the browser would, against the current document. */
const runStateScript = (defaultOpen = true) => new Function(getCollapsibleStateScript(KEY, defaultOpen))()

describe('PersistedCollapsible', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('opens by default and labels the toggle with the action it performs', () => {
    render(<Section />)

    const toggle = screen.getByTestId('Toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Hide')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByTestId('Section')).toHaveAttribute('data-open', 'true')
  })

  it('collapses, hides the body from the accessibility tree and remembers it', () => {
    render(<Section />)

    fireEvent.click(screen.getByTestId('Toggle'))

    expect(screen.getByTestId('Toggle')).toHaveAccessibleName('Show')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByTestId('Section')).toHaveAttribute('data-open', 'false')
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('does not render the state script on client renders', () => {
    const { container } = render(<Section />)

    expect(container.querySelector('script')).not.toBeInTheDocument()
  })

  describe('server-rendered HTML', () => {
    it('includes the state script, which collapses a remembered section before paint', () => {
      document.body.innerHTML = renderToString(<Section />)
      const section = document.querySelector('[data-collapsible-key]')!
      const body = section.querySelector('[data-collapsible-body]')!

      expect(section.querySelector('script')).toBeInTheDocument()
      expect(body).not.toHaveAttribute('hidden')

      localStorage.setItem(KEY, 'false')
      runStateScript()

      expect(section).toHaveAttribute('data-open', 'false')
      expect(body).toHaveAttribute('hidden')
    })

    it('opens a remembered section whose default is closed', () => {
      document.body.innerHTML = renderToString(<Section defaultOpen={false} />)
      const section = document.querySelector('[data-collapsible-key]')!

      localStorage.setItem(KEY, 'true')
      runStateScript(false)

      expect(section).toHaveAttribute('data-open', 'true')
      expect(section.querySelector('[data-collapsible-body]')).not.toHaveAttribute('hidden')
    })

    it('keeps the default when nothing was stored or storage is blocked', () => {
      document.body.innerHTML = renderToString(<Section />)
      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('blocked')
      })

      expect(() => runStateScript()).not.toThrow()
      expect(document.querySelector('[data-collapsible-key]')).toHaveAttribute('data-open', 'true')
    })

    it('hydrates over the script-adjusted HTML without errors and drops the script', async () => {
      const container = document.createElement('div')
      container.innerHTML = renderToString(<Section />)
      document.body.appendChild(container)
      localStorage.setItem(KEY, 'false')
      runStateScript()

      const onRecoverableError = vi.fn()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      await act(async () => {
        hydrateRoot(container, <Section />, { onRecoverableError })
      })

      expect(onRecoverableError).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
      expect(container.querySelector('[data-collapsible-key]')).toHaveAttribute('data-open', 'false')
      expect(container.querySelector('[data-collapsible-body]')).toHaveAttribute('hidden')
      expect(container.querySelector('button')).toHaveAttribute('aria-expanded', 'false')
      expect(container.querySelector('script')).not.toBeInTheDocument()

      consoleError.mockRestore()
    })
  })

  it('escapes the key so it cannot close the script tag', () => {
    const script = getCollapsibleStateScript('</script><img src=x>', true)

    expect(script).not.toContain('</script>')
  })
})
