// Generic Dropdown container for v3
// Handles open/close logic, positioning, and click-outside detection

import { useState, useRef, ReactNode, ReactElement, cloneElement, FC, MouseEvent } from 'react'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { cn } from '@/lib/utils'

export interface DropdownProps {
  trigger: ReactElement<any, any> // The element that toggles the dropdown
  children: ReactNode | ((close: () => void) => ReactNode) // Dropdown content
  className?: string
  contentClassName?: string
  direction?: 'bottom-left' | 'bottom-right'
}

export const Dropdown: FC<DropdownProps> = ({
  trigger,
  children,
  className,
  contentClassName,
  direction = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // control expand/collapse of the dropdown
  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)
  useClickOutside([dropdownRef], close)

  // Clone the trigger to inject onClick
  const triggerWithProps = cloneElement(trigger, {
    onClick: (e: MouseEvent) => {
      if (typeof trigger.props.onClick === 'function') {
        trigger.props.onClick(e)
      }
      toggle()
    },
    'aria-expanded': isOpen,
    'aria-haspopup': true,
  })

  return (
    <div ref={dropdownRef} className={cn('inline-block relative', className)}>
      {triggerWithProps}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full z-[1000]',
            direction === 'bottom-left' ? 'right-0' : 'left-0',
            contentClassName,
          )}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}
