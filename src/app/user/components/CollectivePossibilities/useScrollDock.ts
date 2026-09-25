'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** The banner counts as gone once its top edge is this far under the top bar. */
const TOP_BAR_OFFSET = 16
/** Below this height the layout has not settled yet and the progress would be meaningless. */
const MIN_SETTLED_HEIGHT = 40
/** Dock above ENTER, undock below EXIT: the gap keeps the bar from flickering at the edge. */
const DOCK_ENTER = 0.75
const DOCK_EXIT = 0.6
/** Fallback for the frame callback, which browsers skip in background tabs. */
const FRAME_FALLBACK_MS = 100

/** How far the banner has scrolled under the top bar, from 0 (in place) to 1 (gone). */
export const getScrollProgress = (bannerTop: number, bannerHeight: number, topBarBottom: number) =>
  Math.min(1, Math.max(0, (topBarBottom + TOP_BAR_OFFSET - bannerTop) / bannerHeight))

export const getNextDocked = (isDocked: boolean, progress: number) =>
  isDocked ? progress > DOCK_EXIT : progress > DOCK_ENTER

const applyProgress = (banner: HTMLElement, tile: HTMLElement | null, progress: number) => {
  banner.style.transform = `scale(${(1 - 0.05 * progress).toFixed(4)})`
  banner.style.opacity = (1 - 0.6 * progress).toFixed(3)
  if (tile) {
    tile.style.transform = `translateY(${(48 * progress).toFixed(1)}px) scale(${(1 + 0.1 * progress).toFixed(4)})`
  }
}

const clearProgress = (banner: HTMLElement, tile: HTMLElement | null) => {
  banner.style.removeProperty('transform')
  banner.style.removeProperty('opacity')
  tile?.style.removeProperty('transform')
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
 * `shouldAnimate` stays false until the first measurement is in, so a page that loads already
 * scrolled (back navigation) shows the bar in place instead of sliding it in.
 */
export const useScrollDock = ({ bannerRef, tileRef, anchor, isEnabled }: UseScrollDockOptions) => {
  const [isDocked, setIsDocked] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const isDockedRef = useRef(false)

  useEffect(() => {
    const banner = bannerRef.current
    const tile = tileRef.current
    if (!isEnabled || !anchor || !banner) return

    const reducedMotion = window.matchMedia?.(REDUCED_MOTION_QUERY)
    let frame = 0
    let fallback: ReturnType<typeof setTimeout> | undefined
    let settleFrame = 0

    const update = () => {
      const rect = banner.getBoundingClientRect()
      if (rect.height < MIN_SETTLED_HEIGHT) return

      const progress = getScrollProgress(rect.top, rect.height, anchor.getBoundingClientRect().top)

      if (reducedMotion?.matches) {
        clearProgress(banner, tile)
      } else {
        applyProgress(banner, tile, progress)
      }

      const nextDocked = getNextDocked(isDockedRef.current, progress)
      if (nextDocked !== isDockedRef.current) {
        isDockedRef.current = nextDocked
        setIsDocked(nextDocked)
      }
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
    reducedMotion?.addEventListener?.('change', schedule)

    // The sidebar or the fonts can still move things around right after mount
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule)
    resizeObserver?.observe(banner)

    update()
    settleFrame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => {
        update()
        setShouldAnimate(true)
      })
    })

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reducedMotion?.removeEventListener?.('change', schedule)
      resizeObserver?.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(settleFrame)
      clearTimeout(fallback)
      clearProgress(banner, tile)
      isDockedRef.current = false
      setIsDocked(false)
      setShouldAnimate(false)
    }
  }, [anchor, bannerRef, tileRef, isEnabled])

  return { isDocked, shouldAnimate }
}
