import { useRef, useEffect, useState, useCallback } from 'react'

interface UseStickyHeaderOptions {
  isEnabled?: boolean
  style?: React.CSSProperties
  /** Threshold in pixels to determine scroll direction change */
  threshold?: number
  /** Initial visibility state */
  initialVisible?: boolean
  /** Behavior mode: 'direction-based' or 'position-based' */
  mode?: 'direction-based' | 'position-based'
}

// Type-safe helper to convert React.CSSProperties key to CSS property name (kebab-case)
const toCSSPropertyName = (key: string): string => {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const useStickyHeader = (options: UseStickyHeaderOptions = {}) => {
  const { isEnabled = true, style = undefined, threshold = 10, mode = 'position-based' } = options

  const headerRef = useRef<HTMLDivElement>(null)
  const originalHeaderTop = useRef<number>(0)
  const appliedStyleKeys = useRef<Set<string>>(new Set())
  const [isSticky, setIsSticky] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const applyStickyStyles = useCallback(() => {
    if (!headerRef.current) return
    // Apply positioning styles first
    headerRef.current.style.position = 'fixed'
    headerRef.current.style.top = '0'
    headerRef.current.style.zIndex = '50'
    headerRef.current.style.width = '100vw'
    headerRef.current.style.left = '0'
    headerRef.current.style.right = '0'
    // Then apply custom styles if provided
    if (style) {
      appliedStyleKeys.current.clear()
      Object.keys(style).forEach(key => {
        appliedStyleKeys.current.add(key)
      })
      Object.assign(headerRef.current.style, style)
    }
  }, [style])

  const clearStickyStyles = useCallback(() => {
    if (!headerRef.current) return
    headerRef.current.style.position = ''
    headerRef.current.style.top = ''
    headerRef.current.style.zIndex = ''
    headerRef.current.style.width = ''
    headerRef.current.style.left = ''
    headerRef.current.style.right = ''
    // Clear custom styles if they were applied
    // Use removeProperty which is the most performant and type-safe way to remove CSS properties
    // It handles both camelCase React.CSSProperties keys and converts them to kebab-case
    const styleObj = headerRef.current.style
    appliedStyleKeys.current.forEach(key => {
      // removeProperty is more performant than setProperty('', '') and semantically correct
      styleObj.removeProperty(toCSSPropertyName(key))
    })
    appliedStyleKeys.current.clear()
  }, [])

  // Automatically apply/clear styles when isSticky changes
  useEffect(() => {
    if (isSticky) {
      applyStickyStyles()
    } else {
      clearStickyStyles()
    }
  }, [isSticky, applyStickyStyles, clearStickyStyles])

  useEffect(() => {
    if (!isEnabled) return

    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      if (mode === 'direction-based') {
        // Direction-based behavior (HeaderMobile style)
        if (Math.abs(scrollY - lastScrollY.current) < threshold) {
          ticking.current = false
          return
        }

        // Store original position on first render for direction-based mode too
        if (headerRef.current && originalHeaderTop.current === 0) {
          originalHeaderTop.current = headerRef.current.offsetTop
        }

        if (scrollY <= originalHeaderTop.current + threshold) {
          // At or near the original position - header in normal layout (not sticky)
          setIsSticky(false)
          setIsVisible(true)
          clearStickyStyles()
        } else if (scrollY > lastScrollY.current && scrollY > threshold) {
          // Scrolling down - make header sticky but hidden
          setIsSticky(true)
          setIsVisible(false)
        } else if (scrollY < lastScrollY.current) {
          // Scrolling up - make header sticky and visible
          setIsSticky(true)
          setIsVisible(true)
        }
      } else {
        // Position-based behavior (LatestProposalsTable style)
        if (!headerRef.current) return

        // Store original position on first render
        if (originalHeaderTop.current === 0) {
          originalHeaderTop.current = headerRef.current.offsetTop
        }

        // When scrolling past the header's original position, make it sticky
        if (scrollY >= originalHeaderTop.current) {
          setIsSticky(true)
          setIsVisible(true)
        } else {
          // When scrolling back up to before the header's original position, return to normal
          setIsSticky(false)
          setIsVisible(true)
        }
      }

      lastScrollY.current = scrollY
      ticking.current = false
    }

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isEnabled, threshold, mode, clearStickyStyles])

  return {
    headerRef,
    isVisible,
    isSticky,
  }
}
