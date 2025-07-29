import { useEffect } from 'react'

interface UseExitOnOutsideClickParams {
  containerRef: React.RefObject<HTMLElement | null>
  condition: boolean
  onExit: () => void
}

export const useExitOnOutsideClick = ({ containerRef, condition, onExit }: UseExitOnOutsideClickParams) => {
  useEffect(() => {
    if (!condition) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (containerRef.current && !containerRef.current.contains(target)) {
        onExit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [containerRef, condition, onExit])
}
