import { act, cleanup, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TopBarDockProvider, useTopBarDock } from './TopBarDockProvider'

const TOP_BAR_HEIGHT = 64
const DOCK_HEIGHT = 76

/** Height of whatever is docked in the slot right now. */
let dockHeight = 0

/** jsdom has no ResizeObserver: this one only reports when the test says the slot resized. */
class ManualResizeObserver {
  static instances = new Set<ManualResizeObserver>()
  constructor(private readonly callback: ResizeObserverCallback) {
    ManualResizeObserver.instances.add(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {
    ManualResizeObserver.instances.delete(this)
  }
  static resize() {
    ManualResizeObserver.instances.forEach(observer =>
      observer.callback([], observer as unknown as ResizeObserver),
    )
  }
}

/** Stands in for the layout header: the slot hangs right under the top bar. */
const TopBar = () => {
  const { isDocked, setSlot } = useTopBarDock()
  return (
    <header data-testid="TopBar" data-docked={isDocked}>
      <div ref={setSlot} data-testid="TopBarSlot" />
    </header>
  )
}

/** Stands in for a page with a prompt that can dock. */
const Page = ({ isActive, isDocked = false }: { isActive: boolean; isDocked?: boolean }) => {
  const { setActive, setDocked } = useTopBarDock()
  useEffect(() => {
    setActive(isActive)
  }, [isActive, setActive])
  useEffect(() => {
    setDocked(isDocked)
  }, [isDocked, setDocked])
  return null
}

const renderLayout = (isActive: boolean, isDocked = false) => {
  const ui = (active: boolean) => (
    <TopBarDockProvider>
      <TopBar />
      <Page isActive={active} isDocked={isDocked} />
    </TopBarDockProvider>
  )
  const { rerender } = render(ui(isActive))
  return { setActive: (active: boolean) => rerender(ui(active)) }
}

const scrollPaddingTop = () => document.documentElement.style.scrollPaddingTop

describe('TopBarDockProvider', () => {
  beforeEach(() => {
    dockHeight = 0
    vi.stubGlobal('ResizeObserver', ManualResizeObserver)

    // jsdom has no layout: give the slot its place under the top bar by hand
    const isSlot = (element: HTMLElement) => element.getAttribute('data-testid') === 'TopBarSlot'
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
      return isSlot(this) ? TOP_BAR_HEIGHT : 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return isSlot(this) ? dockHeight : 0
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reports a docked prompt only while the page has one active', () => {
    const { setActive } = renderLayout(true, true)
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'true')

    // A page that drops its prompt without undocking it first must not leave the Connect hidden
    setActive(false)

    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'false')
  })

  it('ignores a docked flag from a page without an active prompt', () => {
    renderLayout(false, true)

    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'false')
  })

  it('leaves the page scroll padding alone without a prompt', () => {
    renderLayout(false)

    expect(scrollPaddingTop()).toBe('')
  })

  it('keeps scrolled-to content clear of the sticky top bar while a prompt is active', () => {
    renderLayout(true)

    expect(scrollPaddingTop()).toBe(`${TOP_BAR_HEIGHT}px`)
  })

  it('makes room for the prompt while it is docked under the bar', () => {
    renderLayout(true)

    dockHeight = DOCK_HEIGHT
    act(() => ManualResizeObserver.resize())

    expect(scrollPaddingTop()).toBe(`${TOP_BAR_HEIGHT + DOCK_HEIGHT}px`)
  })

  it('drops the padding once the prompt goes', () => {
    const { setActive } = renderLayout(true)

    setActive(false)

    expect(scrollPaddingTop()).toBe('')
  })
})
