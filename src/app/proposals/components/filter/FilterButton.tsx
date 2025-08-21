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
  useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled, setIsOpen])
  return (
    <button
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      className={cn({ 'opacity-50': disabled }, className)}
      data-testid="FilterButton"
      {...props}
    >
      {isOpen ? <CloseIcon /> : <FilterIcon color={isFiltering ? 'var(--color-primary)' : undefined} />}
    </button>
  )
}
