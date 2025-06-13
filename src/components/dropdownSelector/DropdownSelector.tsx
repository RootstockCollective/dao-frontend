import { FC, ReactNode, useState, useCallback } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion } from 'motion/react'
import { DropdownSelectorItem } from './DropdownSelectorItem'
import { Label } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

export interface SelectorOption {
  label: string
  id: string
  sublabel?: string
}

export interface DropdownSelectorProps {
  title: string
  options: SelectorOption[]
  selected: string[]
  onChange?: (selectedValues: string[]) => void
  className?: string
  trigger: ReactNode | ((isOpen: boolean) => ReactNode)
  align?: 'start' | 'center' | 'end'
}

export const DropdownSelector: FC<DropdownSelectorProps> = ({
  title,
  options,
  selected,
  onChange,
  className,
  trigger,
  align = 'end',
}) => {
  const [open, setOpen] = useState(false)

  const handleItemClick = useCallback((item: SelectorOption): void => {
    const newSelected = selected.includes(item.id)
      ? selected.filter(v => v !== item.id)
      : [...selected, item.id]
    
    onChange?.(newSelected)
  }, [selected, onChange])

  const renderTrigger = (): ReactNode => {
    return typeof trigger === 'function' ? trigger(open) : trigger
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger 
        className="focus:outline-none focus:ring-0 cursor-pointer"
        aria-label={title}
      >
        {renderTrigger()}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          className={cn('z-[1000] min-w-[220px] rounded p-1 shadow-md')}
          sideOffset={5}
          align={align}
          role="listbox"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn('bg-v3-bg-accent-100 rounded shadow-lg p-6', className)}
          >
            <Label className="pb-2 text-v3-bg-accent-0 text-sm uppercase">{title}</Label>
            <DropdownMenu.Group className="w-full" role="group">
              {options.map(item => (
                <DropdownMenu.Item
                  key={item.id}
                  className="outline-none"
                  onSelect={e => {
                    e.preventDefault()
                    handleItemClick(item)
                  }}
                  role="option"
                  aria-selected={selected.includes(item.id)}
                >
                  <DropdownSelectorItem
                    label={item.label}
                    sublabel={item.sublabel}
                    checked={selected.includes(item.id)}
                  />
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
