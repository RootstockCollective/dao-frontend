import { FilterIcon, CloseIconKoto } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { HTMLAttributes, useEffect } from 'react'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  disabled?: boolean
  isFiltering?: boolean
}

/**
 * Toggle button that opens and closes the filter sidebar.
 * Used in proposals, staking history, and transaction history tables.
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
      {isOpen ? <CloseIconKoto /> : <FilterIcon color={isFiltering ? 'var(--color-primary)' : undefined} />}
    </button>
  )
}
