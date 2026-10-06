import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'

import { MotionLogo } from './MotionLogo'

/**
 * Whether the video is on screen. False when the page has scrolled it away, or when a breakpoint
 * hides it with display: none, which never intersects.
 */
let isOnScreen = true

/** jsdom has no IntersectionObserver: report `isOnScreen` on observe and on `scroll()`. */
class FakeIntersectionObserver {
  static instance: FakeIntersectionObserver | undefined
  private target: Element | undefined
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instance = this
  }
  observe(target: Element) {
    this.target = target
    this.report()
  }
  unobserve() {}
  disconnect() {}
  report() {
    const entry = { target: this.target, isIntersecting: isOnScreen }
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
  static scroll(onScreen: boolean) {
    isOnScreen = onScreen
    act(() => FakeIntersectionObserver.instance?.report())
  }
}

const mockReducedMotion = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList)

describe('MotionLogo', () => {
  let play: MockInstance<HTMLMediaElement['play']>
  let pause: MockInstance<HTMLMediaElement['pause']>

  beforeEach(() => {
    // jsdom does not implement media playback
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    isOnScreen = true
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the same video markup whatever the motion preference, so SSR and hydration agree', () => {
    mockReducedMotion(true)
    const { container: reduced } = render(<MotionLogo />)
    const reducedMarkup = reduced.innerHTML
    cleanup()

    mockReducedMotion(false)
    const { container: full } = render(<MotionLogo />)

    expect(full.innerHTML).toBe(reducedMarkup)
    expect(screen.getByTestId('MotionLogoVideo')).not.toHaveAttribute('autoplay')
  })

  it('plays the animation when motion is allowed', () => {
    mockReducedMotion(false)

    render(<MotionLogo />)

    expect(play).toHaveBeenCalledOnce()
  })

  it('stays transparent under prefers-reduced-motion, leaving the poster underneath', () => {
    mockReducedMotion(true)

    render(<MotionLogo />)

    expect(play).not.toHaveBeenCalled()
    expect(pause).toHaveBeenCalled()
    expect(screen.getByTestId('MotionLogoVideo')).toHaveClass('opacity-0')
  })

  it('fades in only once the video is actually playing', () => {
    mockReducedMotion(false)

    render(<MotionLogo />)
    const video = screen.getByTestId('MotionLogoVideo')

    expect(video).toHaveClass('opacity-0')
    expect(video).not.toHaveAttribute('controls')

    fireEvent.playing(video)

    expect(video).toHaveClass('opacity-100')
    expect(video).not.toHaveClass('opacity-0')
  })

  it('neither loads nor plays the video while it is off screen or hidden by the layout', () => {
    mockReducedMotion(false)
    isOnScreen = false

    render(<MotionLogo />)

    expect(play).not.toHaveBeenCalled()
    expect(screen.getByTestId('MotionLogoVideo')).toHaveAttribute('preload', 'none')
  })

  it('stops the loop once the page scrolls it away and starts it again on the way back', () => {
    mockReducedMotion(false)
    render(<MotionLogo />)
    expect(play).toHaveBeenCalledOnce()
    pause.mockClear()

    FakeIntersectionObserver.scroll(false)
    expect(pause).toHaveBeenCalledOnce()

    FakeIntersectionObserver.scroll(true)
    expect(play).toHaveBeenCalledTimes(2)
  })

  it('holds the loop while paused, on screen or not', () => {
    mockReducedMotion(false)
    const { rerender } = render(<MotionLogo paused />)
    expect(play).not.toHaveBeenCalled()

    rerender(<MotionLogo />)

    expect(play).toHaveBeenCalledOnce()
  })

  it('fades back to the poster when the video stops', () => {
    mockReducedMotion(false)

    render(<MotionLogo />)
    const video = screen.getByTestId('MotionLogoVideo')
    fireEvent.playing(video)
    fireEvent.pause(video)

    expect(video).toHaveClass('opacity-0')
    expect(video).not.toHaveClass('opacity-100')
  })

  it('keeps the poster when the browser refuses to autoplay', async () => {
    mockReducedMotion(false)
    play.mockRejectedValue(new DOMException('NotAllowedError'))

    expect(() => render(<MotionLogo />)).not.toThrow()
    await Promise.resolve()
  })
})
