import { FC, ReactNode, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion } from 'motion/react'
import { Label } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

export interface DropdownProps {
  title?: string
  children: ReactNode
  className?: string
  trigger: ReactNode | ((isOpen: boolean) => ReactNode)
  align?: 'start' | 'center' | 'end'
}

export const Dropdown: FC<DropdownProps> = ({ title, children, className, trigger, align = 'end' }) => {
  const [open, setOpen] = useState(false)

  const renderTrigger = (): ReactNode => {
    return typeof trigger === 'function' ? trigger(open) : trigger
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} data-testid="dropdown-selector-root">
      <DropdownMenu.Trigger
        className="focus:outline-none focus:ring-0 cursor-pointer"
        aria-label={title}
        data-testid="dropdown-selector-trigger"
      >
        {renderTrigger()}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          className={cn('z-[1000] min-w-[220px] rounded p-1 shadow-md')}
          sideOffset={5}
          align={align}
          data-testid="dropdown-selector-content"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn('bg-v3-bg-accent-100 rounded shadow-lg p-6', className)}
          >
            {title && (
              <Label
                className="pb-2 text-v3-bg-accent-0 text-sm uppercase"
                data-testid="dropdown-selector-title"
              >
                {title}
              </Label>
            )}
            <DropdownMenu.Group className="w-full" data-testid="dropdown-selector-group">
              {children}
            </DropdownMenu.Group>
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
