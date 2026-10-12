import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'

import { MotionLogo } from './MotionLogo'

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
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

  it('holds on the poster frame under prefers-reduced-motion', () => {
    mockReducedMotion(true)

    render(<MotionLogo />)

    expect(play).not.toHaveBeenCalled()
    expect(pause).toHaveBeenCalled()
    expect(screen.getByTestId('MotionLogoVideo')).toHaveAttribute(
      'poster',
      '/images/collective-motion-logo-poster.webp',
    )
  })

  it('keeps the poster when the browser refuses to autoplay', async () => {
    mockReducedMotion(false)
    play.mockRejectedValue(new DOMException('NotAllowedError'))

    expect(() => render(<MotionLogo />)).not.toThrow()
    await Promise.resolve()
  })
})
