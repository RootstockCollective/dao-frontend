import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TopBarDockProvider, useTopBarDock } from '@/components/MainContainer/TopBarDockProvider'
import type { ConnectWorkflowProps } from '@/shared/walletConnection/types'

import { CollectivePossibilities, DISMISSED_STORAGE_KEY } from './CollectivePossibilities'
import { FRAME_FALLBACK_MS } from './useScrollDock'

// Renders the page's own button, so the tests see the element the banner and the dock pass in
vi.mock('@/shared/walletConnection/connection/ConnectWorkflow', () => ({
  ConnectWorkflow: ({ ConnectComponent }: ConnectWorkflowProps) =>
    ConnectComponent ? <ConnectComponent onClick={() => {}} /> : null,
}))

const BANNER_HEIGHT = 300
const TOP_BAR_BOTTOM = 64

/** jsdom has no ResizeObserver: report every observed element as laid out. */
class LaidOutResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    const entry = { target, contentRect: DOMRect.fromRect({ width: 260, height: 300 }) }
    this.callback([entry as ResizeObserverEntry], this as unknown as ResizeObserver)
  }
  unobserve() {}
  disconnect() {}
}

/** Stands in for the layout header: exposes the dock state and hosts the slot. */
const TopBar = () => {
  const { isActive, isDocked, setSlot } = useTopBarDock()
  return (
    <div data-testid="TopBar" data-active={isActive} data-docked={isDocked}>
      <div ref={setSlot} data-testid="TopBarSlot" />
    </div>
  )
}

const renderOnPage = () =>
  render(
    <TopBarDockProvider>
      <TopBar />
      <CollectivePossibilities />
      <a href="#latest">Latest from the Collective</a>
    </TopBarDockProvider>,
  )

const mockReducedMotion = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList)

let bannerTop = 136

const setScrollY = (y: number) => Object.defineProperty(window, 'scrollY', { value: y, configurable: true })

/** Scrolls and runs the frame (or its timeout fallback) the banner measures itself in. */
const scrollBannerTo = (top: number) => {
  bannerTop = top
  setScrollY(136 - top)
  act(() => {
    fireEvent.scroll(window)
    vi.advanceTimersByTime(FRAME_FALLBACK_MS)
  })
}

describe('CollectivePossibilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom does not implement media playback, and the logo starts its video on mount
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    mockReducedMotion(false)
    vi.stubGlobal('ResizeObserver', LaidOutResizeObserver)

    localStorage.clear()

    // jsdom has no layout: place the banner and the top bar by hand
    bannerTop = 136
    setScrollY(0)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.getAttribute('data-testid') === 'TopBarSlot') {
        return DOMRect.fromRect({ y: TOP_BAR_BOTTOM, height: 0 })
      }
      if (this.tagName === 'SECTION') {
        // As in a browser, the box on screen shrinks with the scale written on the banner
        const scale = Number((this as HTMLElement).style.transform.match(/scale\(([\d.]+)\)/)?.[1] ?? 1)
        return DOMRect.fromRect({ y: bannerTop, height: BANNER_HEIGHT * scale })
      }
      return DOMRect.fromRect()
    })
    // ...while its layout height does not
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.tagName === 'SECTION' ? BANNER_HEIGHT : 0
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the three possibilities, the animated logo and the connect action', () => {
    renderOnPage()

    expect(screen.getAllByText("Don't miss")[0]).toBeInTheDocument()
    expect(screen.getByTestId('PossibilitiesTile')).toContainElement(screen.getByTestId('MotionLogoVideo'))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Build')).toBeInTheDocument()
  })

  it('names the region after its title', () => {
    renderOnPage()

    expect(screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })).toBeInTheDocument()
  })

  it('labels both X buttons after what they dismiss', () => {
    renderOnPage()

    expect(screen.getByTestId('DismissPossibilitiesButton')).toHaveAccessibleName(
      "Dismiss the Don't Miss banner",
    )
    expect(screen.getByTestId('DismissDockButton')).toHaveAccessibleName('Dismiss the connect prompt')
  })

  it('makes the top bar sticky and parks a closed, inert dock in its slot', () => {
    renderOnPage()

    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-active', 'true')
    const dock = screen.getByTestId('PossibilitiesDock')
    expect(screen.getByTestId('TopBarSlot')).toContainElement(dock)
    expect(dock).toHaveAttribute('data-docked', 'false')
    expect(dock).toHaveAttribute('inert')
  })

  it('starts in place at the top of the page, without inline styles or promoted layers', () => {
    renderOnPage()

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toBe('')
    expect(banner.style.opacity).toBe('')
    expect(banner.style.willChange).toBe('')
  })

  it('never fades at the top of the page, even when the banner starts right under the top bar', () => {
    // Mobile: a taller header and no gap would put the progress above 0 before any scroll
    bannerTop = TOP_BAR_BOTTOM
    renderOnPage()

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toBe('')
    expect(banner.style.opacity).toBe('')
    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'false')
  })

  it('shrinks and fades the banner as it scrolls under the top bar', () => {
    renderOnPage()

    // Halfway under: 64 + 16 - (-70) = 150 of 300
    scrollBannerTo(-70)

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toMatch(/^scale\(0\.975/)
    expect(Number(banner.style.opacity)).toBeCloseTo(0.7)
    expect(banner.style.willChange).toBe('transform, opacity')
    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'false')
  })

  it('measures the progress against the unscaled banner, so it does not feed on its own shrink', () => {
    renderOnPage()

    scrollBannerTo(-125) // 68%, the banner is now scaled to ~96.6%
    scrollBannerTo(-139) // 73%: against the scaled height it would read 75.6% and dock

    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'false')
  })

  it('docks past 75% and undocks below 60%', () => {
    renderOnPage()
    const dock = screen.getByTestId('PossibilitiesDock')

    scrollBannerTo(-160) // 80%
    expect(dock).toHaveAttribute('data-docked', 'true')
    expect(dock).not.toHaveAttribute('inert')
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'true')

    scrollBannerTo(-110) // 63%: inside the gap, stays docked
    expect(dock).toHaveAttribute('data-docked', 'true')

    scrollBannerTo(-90) // 57%
    expect(dock).toHaveAttribute('data-docked', 'false')
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'false')
  })

  it('still measures when the browser skips animation frames, as in a background tab', () => {
    vi.stubGlobal('requestAnimationFrame', () => 0)
    renderOnPage()

    scrollBannerTo(-160)

    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'true')
  })

  it('keeps the focus on the banner Connect button when the dock comes in', () => {
    renderOnPage()
    const connect = screen.getByTestId('ConnectButton')
    connect.focus()

    scrollBannerTo(-160)
    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'true')

    expect(screen.getByTestId('ConnectButton')).toBe(connect)
    expect(connect).toHaveFocus()
  })

  it('keeps the banner still under prefers-reduced-motion but still docks', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList)
    renderOnPage()

    scrollBannerTo(-160)

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toBe('')
    expect(banner.style.opacity).toBe('')
    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'true')
  })

  it('removes the banner and the dock from the banner X', () => {
    renderOnPage()

    fireEvent.click(screen.getByTestId('DismissPossibilitiesButton'))

    expect(screen.queryByTestId('CollectivePossibilities')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PossibilitiesDock')).not.toBeInTheDocument()
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-active', 'false')
  })

  it('removes the banner and the dock from the dock X', () => {
    renderOnPage()
    scrollBannerTo(-160)

    fireEvent.click(screen.getByTestId('DismissDockButton'))

    expect(screen.queryByTestId('CollectivePossibilities')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PossibilitiesDock')).not.toBeInTheDocument()
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'false')
  })

  it('hands the focus to what follows the banner when its X goes', () => {
    renderOnPage()
    const dismiss = screen.getByTestId('DismissPossibilitiesButton')
    dismiss.focus()

    fireEvent.click(dismiss)

    expect(screen.getByRole('link', { name: 'Latest from the Collective' })).toHaveFocus()
  })

  it('hands the focus to what follows the banner when the dock X goes', () => {
    renderOnPage()
    scrollBannerTo(-160)
    const dismiss = screen.getByTestId('DismissDockButton')
    dismiss.focus()

    fireEvent.click(dismiss)

    expect(screen.getByRole('link', { name: 'Latest from the Collective' })).toHaveFocus()
  })

  it('remembers the dismissal across reloads', () => {
    const { unmount } = renderOnPage()
    fireEvent.click(screen.getByTestId('DismissPossibilitiesButton'))
    unmount()

    expect(localStorage.getItem(DISMISSED_STORAGE_KEY)).toBe('true')

    renderOnPage()
    expect(screen.queryByTestId('CollectivePossibilities')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PossibilitiesDock')).not.toBeInTheDocument()
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-active', 'false')
  })
})
