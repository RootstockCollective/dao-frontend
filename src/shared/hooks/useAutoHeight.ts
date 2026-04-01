'use client'

import { useCallback, useEffect, type RefObject } from 'react'

export interface UseAutoHeightOptions {
  /** Selector for the element to measure (e.g., 'textarea', '.my-input') */
  elementSelector: string
  /** Minimum height for the element */
  minHeight: number
  /** Optional selector for a container to also resize */
  containerSelector?: string
  /** Fixed offset added to element height for container (e.g., toolbar height) */
  containerOffset?: number
}

/**
 * Encapsulates all DOM manipulation logic required to make any element auto-grow.
 * Works with textareas, contenteditable divs, or any element with scrollHeight.
 */
export const useAutoHeight = (
  wrapperRef: RefObject<HTMLElement | null>,
  value: string,
  options: UseAutoHeightOptions,
) => {
  const { elementSelector, containerSelector, containerOffset = 0, minHeight } = options

  const adjustHeight = useCallback(() => {
    if (!wrapperRef.current) return
    const element = wrapperRef.current.querySelector<HTMLElement>(elementSelector)
    if (!element) return

    element.style.height = 'auto'
    const scrollHeight = element.scrollHeight
    const elementHeight = Math.max(minHeight, scrollHeight)
    element.style.height = `${elementHeight}px`

    if (containerSelector) {
      const container = wrapperRef.current.querySelector<HTMLElement>(containerSelector)
      if (container) {
        container.style.height = `${elementHeight + containerOffset}px`
      }
    }
  }, [wrapperRef, elementSelector, containerSelector, containerOffset, minHeight])

  useEffect(() => {
    requestAnimationFrame(adjustHeight)
  }, [value, adjustHeight])

  useEffect(() => {
    window.addEventListener('resize', adjustHeight)
    return () => window.removeEventListener('resize', adjustHeight)
  }, [adjustHeight])

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new MutationObserver(() => {
      if (wrapperRef.current?.querySelector(elementSelector)) {
        adjustHeight()
        observer.disconnect()
      }
    })
    observer.observe(wrapperRef.current, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [wrapperRef, elementSelector, adjustHeight])
}
