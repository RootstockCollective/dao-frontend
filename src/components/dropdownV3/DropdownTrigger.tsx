import React from 'react'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { X } from 'lucide-react'

interface DropdownTriggerProps {
  className?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  className,
  'aria-expanded': isOpen,
  'aria-haspopup': hasPopup,
  onClick,
}) => {
  return (
    <button
      type="button"
      className={className}
      aria-expanded={isOpen}
      aria-haspopup={hasPopup}
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X className="w-6 h-6 text-white" /> : <MoreIcon className="w-5 h-5 text-white" />}
    </button>
  )
}
