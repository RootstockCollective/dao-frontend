'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'

/** The banner counts as gone once its top edge is this far under the top bar. */
const TOP_BAR_OFFSET = 16
/** Below this height the layout has not settled yet and the progress would be meaningless. */
const MIN_SETTLED_HEIGHT = 40
/** Dock above ENTER, undock below EXIT: the gap keeps the bar from flickering at the edge. */
const DOCK_ENTER = 0.75
const DOCK_EXIT = 0.6
/** Fallback for the frame callback, which browsers skip in background tabs. */
export const FRAME_FALLBACK_MS = 100

/** How far the banner has scrolled under the top bar, from 0 (in place) to 1 (gone). */
export const getScrollProgress = (bannerTop: number, bannerHeight: number, topBarBottom: number) =>
  Math.min(1, Math.max(0, (topBarBottom + TOP_BAR_OFFSET - bannerTop) / bannerHeight))

export const getNextDocked = (isDocked: boolean, progress: number) =>
  isDocked ? progress > DOCK_EXIT : progress > DOCK_ENTER

const clearProgress = (banner: HTMLElement, tile: HTMLElement | null) => {
  banner.style.removeProperty('transform')
  banner.style.removeProperty('opacity')
  banner.style.removeProperty('will-change')
  tile?.style.removeProperty('transform')
  tile?.style.removeProperty('will-change')
}

const applyProgress = (banner: HTMLElement, tile: HTMLElement | null, progress: number) => {
  // In place it looks as it would without any of this, so no inline styles and no layers
  if (progress <= 0) {
    clearProgress(banner, tile)
    return
  }

  // Layers are only promoted while the banner is on its way out, not once it is gone
  const isMoving = progress < 1
  banner.style.willChange = isMoving ? 'transform, opacity' : ''
  banner.style.transform = `scale(${(1 - 0.05 * progress).toFixed(4)})`
  banner.style.opacity = (1 - 0.6 * progress).toFixed(3)
  if (tile) {
    tile.style.willChange = isMoving ? 'transform' : ''
    tile.style.transform = `translateY(${(48 * progress).toFixed(1)}px) scale(${(1 + 0.1 * progress).toFixed(4)})`
  }
}

interface UseScrollDockOptions {
  bannerRef: RefObject<HTMLElement | null>
  /** Inner layer of the logo tile, which drifts down for a parallax effect. */
  tileRef: RefObject<HTMLElement | null>
  /** Element sitting right under the top bar row; its top edge is where the banner tucks under. */
  anchor: HTMLElement | null
  isEnabled: boolean
}

/**
 * Ties the Don't Miss banner to the scroll position: it shrinks to 95% and fades to 40% as it
 * slides under the top bar, and reports when it is far enough gone for the compact bar to dock.
 *
 * The styles are written straight onto the elements, once per frame at most, so scrolling never
 * re-renders; state changes only when the docked flag flips. Under prefers-reduced-motion the
 * banner stays still and only the docked flag is tracked.
 *
 * `shouldAnimate` is false whenever the bar has to appear in place rather than slide in: until
 * the layout has settled, and when it docks straight from a banner in place. That is a jump, not
 * a scroll: a page that loads already scrolled, with the browser restoring the position once the
 * content is in (reload, back navigation), an anchor, or the End key.
 */
export const useScrollDock = ({ bannerRef, tileRef, anchor, isEnabled }: UseScrollDockOptions) => {
  const [isDocked, setIsDocked] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const isDockedRef = useRef(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const banner = bannerRef.current
    const tile = tileRef.current
    if (!isEnabled || !anchor || !banner) return

    let frame = 0
    let fallback: ReturnType<typeof setTimeout> | undefined
    let settleFrame = 0
    let animateFrame = 0
    // Progress at the last measurement. The banner counts as in place until it has one
    let lastProgress = 0

    // Lets the bar slide again only once the state just set has been painted without transitions
    const animateAfterNextPaint = () => {
      cancelAnimationFrame(animateFrame)
      animateFrame = requestAnimationFrame(() => {
        animateFrame = requestAnimationFrame(() => setShouldAnimate(true))
      })
    }

    const update = () => {
      // offsetHeight ignores the scale written below. The on-screen height would shrink with it
      // and feed each frame's progress into the next measurement.
      const height = banner.offsetHeight
      if (height < MIN_SETTLED_HEIGHT) return

      // At the very top the banner is in place by definition, even where it sits close enough to
      // the top bar for the formula to start above 0 (the mobile header is taller). Its top edge
      // is not moved by the scale, which grows from it.
      const progress =
        window.scrollY <= 0
          ? 0
          : getScrollProgress(banner.getBoundingClientRect().top, height, anchor.getBoundingClientRect().top)

      if (prefersReducedMotion) {
        clearProgress(banner, tile)
      } else {
        applyProgress(banner, tile, progress)
      }

      const nextDocked = getNextDocked(isDockedRef.current, progress)
      if (nextDocked !== isDockedRef.current) {
        if (lastProgress <= 0) {
          setShouldAnimate(false)
          animateAfterNextPaint()
        }
        isDockedRef.current = nextDocked
        setIsDocked(nextDocked)
      }
      lastProgress = progress
    }

    const run = () => {
      cancelAnimationFrame(frame)
      clearTimeout(fallback)
      frame = 0
      fallback = undefined
      update()
    }

    const schedule = () => {
      if (frame || fallback) return
      frame = requestAnimationFrame(run)
      fallback = setTimeout(run, FRAME_FALLBACK_MS)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // The sidebar or the fonts can still move things around right after mount
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule)
    resizeObserver?.observe(banner)

    update()
    settleFrame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => {
        update()
        animateAfterNextPaint()
      })
    })

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resizeObserver?.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(settleFrame)
      cancelAnimationFrame(animateFrame)
      clearTimeout(fallback)
      clearProgress(banner, tile)
      isDockedRef.current = false
      setIsDocked(false)
      setShouldAnimate(false)
    }
  }, [anchor, bannerRef, tileRef, isEnabled, prefersReducedMotion])

  return { isDocked, shouldAnimate }
}
