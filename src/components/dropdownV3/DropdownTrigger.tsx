import { MoreIcon } from '@/components/Icons/MoreIcon'
import { X } from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { FC, MouseEvent } from 'react'

interface DropdownTriggerProps {
  className?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: boolean
  onClick?: (e: MouseEvent) => void
}

export const DropdownTrigger: FC<DropdownTriggerProps> = ({
  className,
  'aria-expanded': isOpen,
  'aria-haspopup': hasPopup,
  onClick,
}) => {
  return (
    <Button
      variant="secondary"
      className={cn('border-none outline-none', className)}
      aria-expanded={isOpen}
      aria-haspopup={hasPopup}
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X className="w-6 h-6 text-white" /> : <MoreIcon className="w-5 h-5 text-white" />}
    </Button>
  )
}
