import { FilterIcon, CloseIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { HTMLAttributes, useEffect, JSX } from 'react'
import { Tooltip } from '@/components/Tooltip'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  disabled?: boolean
  isFiltering?: boolean
}

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
    <Tooltip disabled={disabled} text={isOpen ? 'Close filter' : 'Filter proposals'}>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn({ 'opacity-50': disabled }, className)}
        {...props}
      >
        {isOpen ? <CloseIcon /> : <FilterIcon color={isFiltering ? 'var(--primary)' : undefined} />}
      </button>
    </Tooltip>
  )
}
