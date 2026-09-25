import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TopBarDockProvider, useTopBarDock } from '@/components/MainContainer/TopBarDockProvider'

import { CollectivePossibilities, DISMISSED_STORAGE_KEY } from './CollectivePossibilities'

vi.mock('@/shared/walletConnection/connection/ConnectWorkflow', () => ({
  ConnectWorkflow: () => <button type="button">Connect wallet</button>,
}))

const BANNER_HEIGHT = 300
const TOP_BAR_BOTTOM = 64

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
    </TopBarDockProvider>,
  )

const mockReducedMotion = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList)

let bannerTop = 136

const scrollBannerTo = async (top: number) => {
  bannerTop = top
  await act(async () => {
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 120))
  })
}

describe('CollectivePossibilities', () => {
  beforeEach(() => {
    // jsdom does not implement media playback, and the logo starts its video on mount
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    mockReducedMotion(false)

    localStorage.clear()

    // jsdom has no layout: place the banner and the top bar by hand
    bannerTop = 136
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.getAttribute('data-testid') === 'TopBarSlot') {
        return DOMRect.fromRect({ y: TOP_BAR_BOTTOM, height: 0 })
      }
      if (this.tagName === 'SECTION') {
        return DOMRect.fromRect({ y: bannerTop, height: BANNER_HEIGHT })
      }
      return DOMRect.fromRect()
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

  it('makes the top bar sticky and parks a closed, inert dock in its slot', () => {
    renderOnPage()

    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-active', 'true')
    const dock = screen.getByTestId('PossibilitiesDock')
    expect(screen.getByTestId('TopBarSlot')).toContainElement(dock)
    expect(dock).toHaveAttribute('data-docked', 'false')
    expect(dock).toHaveAttribute('inert')
  })

  it('starts in place at the top of the page', () => {
    renderOnPage()

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toMatch(/^scale\(1(\.0+)?\)$/)
    expect(Number(banner.style.opacity)).toBe(1)
  })

  it('shrinks and fades the banner as it scrolls under the top bar', async () => {
    renderOnPage()

    // Halfway under: 64 + 16 - (-70) = 150 of 300
    await scrollBannerTo(-70)

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toMatch(/^scale\(0\.975/)
    expect(Number(banner.style.opacity)).toBeCloseTo(0.7)
    expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'false')
  })

  it('docks past 75% and undocks below 60%', async () => {
    renderOnPage()
    const dock = screen.getByTestId('PossibilitiesDock')

    await scrollBannerTo(-160) // 80%
    await waitFor(() => expect(dock).toHaveAttribute('data-docked', 'true'))
    expect(dock).not.toHaveAttribute('inert')
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'true')

    await scrollBannerTo(-110) // 63%: inside the gap, stays docked
    expect(dock).toHaveAttribute('data-docked', 'true')

    await scrollBannerTo(-90) // 57%
    await waitFor(() => expect(dock).toHaveAttribute('data-docked', 'false'))
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'false')
  })

  it('keeps the banner still under prefers-reduced-motion but still docks', async () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList)
    renderOnPage()

    await scrollBannerTo(-160)

    const banner = screen.getByRole('region', { name: 'THE COLLECTIVE POSSIBILITIES' })
    expect(banner.style.transform).toBe('')
    expect(banner.style.opacity).toBe('')
    await waitFor(() =>
      expect(screen.getByTestId('PossibilitiesDock')).toHaveAttribute('data-docked', 'true'),
    )
  })

  it('removes the banner and the dock from the banner X', () => {
    renderOnPage()

    fireEvent.click(screen.getByTestId('DismissPossibilitiesButton'))

    expect(screen.queryByTestId('CollectivePossibilities')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PossibilitiesDock')).not.toBeInTheDocument()
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-active', 'false')
  })

  it('removes the banner and the dock from the dock X', async () => {
    renderOnPage()
    await scrollBannerTo(-160)

    fireEvent.click(screen.getByTestId('DismissDockButton'))

    expect(screen.queryByTestId('CollectivePossibilities')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PossibilitiesDock')).not.toBeInTheDocument()
    expect(screen.getByTestId('TopBar')).toHaveAttribute('data-docked', 'false')
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
