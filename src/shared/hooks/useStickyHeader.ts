import { useRef, useEffect } from 'react'

interface UseStickyHeaderOptions {
  isEnabled?: boolean
  zIndex?: string
  backgroundColor?: string
  padding?: {
    left?: string
    right?: string
    top?: string
    bottom?: string
  }
}

export const useStickyHeader = (options: UseStickyHeaderOptions = {}) => {
  const {
    isEnabled = true,
    zIndex = '50',
    backgroundColor = 'var(--color-bg-80)',
    padding = {
      left: '1.5rem',
      right: '1.5rem',
      top: '1rem',
      bottom: '1rem',
    },
  } = options

  const headerRef = useRef<HTMLDivElement>(null)
  const originalHeaderTop = useRef<number>(0)

  // Sticky header styles
  const stickyStyles = {
    position: 'fixed',
    top: '0',
    zIndex,
    backgroundColor,
    width: '100vw',
    left: '0',
    right: '0',
    paddingLeft: padding.left,
    paddingRight: padding.right,
    paddingTop: padding.top,
    paddingBottom: padding.bottom,
  }

  const clearStickyStyles = () => {
    if (!headerRef.current) return
    headerRef.current.style.position = ''
    headerRef.current.style.top = ''
    headerRef.current.style.zIndex = ''
    headerRef.current.style.backgroundColor = ''
    headerRef.current.style.width = ''
    headerRef.current.style.left = ''
    headerRef.current.style.right = ''
    headerRef.current.style.paddingLeft = ''
    headerRef.current.style.paddingRight = ''
    headerRef.current.style.paddingTop = ''
    headerRef.current.style.paddingBottom = ''
  }

  useEffect(() => {
    if (!isEnabled) return

    const handleScroll = () => {
      if (!headerRef.current) return

      const scrollY = window.scrollY

      // If we haven't stored the original position yet, get it from the element's offsetTop
      if (originalHeaderTop.current === 0) {
        originalHeaderTop.current = headerRef.current.offsetTop
      }

      // When scrolling past the header's original position, make it fixed
      if (scrollY >= originalHeaderTop.current) {
        Object.assign(headerRef.current.style, stickyStyles)
      }
      // When scrolling back up to before the header's original position, return to normal layout
      else if (scrollY < originalHeaderTop.current) {
        clearStickyStyles()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isEnabled, zIndex, backgroundColor, padding.left, padding.right, padding.top, padding.bottom])

  return { headerRef }
}
