import { FilterIcon, CloseIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
}

export function FilterButton({ isOpen, setIsOpen, className, ...props }: Props) {
  return (
    <button onClick={() => setIsOpen(!isOpen)} className={cn('', className)} {...props}>
      {isOpen ? <CloseIcon /> : <FilterIcon />}
    </button>
  )
}
