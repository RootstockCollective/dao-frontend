'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'

const TOP_BAR_OFFSET = 16
const MIN_SETTLED_HEIGHT = 40
const DOCK_ENTER = 0.75
const DOCK_EXIT = 0.6
export const FRAME_FALLBACK_MS = 100

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
  if (progress <= 0) {
    clearProgress(banner, tile)
    return
  }

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
  tileRef: RefObject<HTMLElement | null>
  anchor: HTMLElement | null
  isEnabled: boolean
}

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
    let lastProgress = 0

    const animateAfterNextPaint = () => {
      cancelAnimationFrame(animateFrame)
      animateFrame = requestAnimationFrame(() => {
        animateFrame = requestAnimationFrame(() => setShouldAnimate(true))
      })
    }

    const update = () => {
      const height = banner.offsetHeight
      if (height < MIN_SETTLED_HEIGHT) return

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
