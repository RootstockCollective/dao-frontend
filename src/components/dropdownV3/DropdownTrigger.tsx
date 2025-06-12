import { MoreIcon } from '@/components/Icons/MoreIcon'
import Image from 'next/image'
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
      {isOpen ? (
        <Image src="/images/close-button.svg" alt="Close menu" width={24} height={24} />
      ) : (
        <MoreIcon />
      )}
    </Button>
  )
}
