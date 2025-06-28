import { FilterIcon, CloseIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { HTMLAttributes, useEffect } from 'react'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  disabled?: boolean
  isFiltering?: boolean
}

/**
 * Toggle button that opens and closes the proposals filter sidebar
 */
export function FilterButton({
  isOpen,
  setIsOpen,
  className,
  disabled = false,
  isFiltering = false,
  ...props
}: Props) {
  // close filter bar if disabled
  useEffect(() => {
    if (!disabled) return
    setIsOpen(false)
  }, [disabled, setIsOpen])
  return (
    <button
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      className={cn({ 'opacity-50': disabled }, className)}
      {...props}
    >
      {isOpen ? <CloseIcon /> : <FilterIcon color={isFiltering ? 'var(--primary)' : undefined} />}
    </button>
  )
}
