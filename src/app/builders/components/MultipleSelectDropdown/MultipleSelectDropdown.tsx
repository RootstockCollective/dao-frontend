import { Label } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { BaseColumnId } from '@/shared/context/TableContext'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { motion } from 'motion/react'
import { ReactNode, useState } from 'react'
import { MultipleSelectDropdownItem } from './MultipleSelectDropdownItem'

export interface SelectorOption<ColumnId extends BaseColumnId = BaseColumnId> {
  id: ColumnId
  label: string
  sublabel?: string
}

interface MultipleSelectDropdownProps<ColumnId extends BaseColumnId = BaseColumnId> {
  title: string
  options: SelectorOption<ColumnId>[]
  selected: ColumnId[]
  onChange?: (selectedValues: ColumnId[]) => void
  className?: string
  trigger: ReactNode | ((isOpen: boolean) => ReactNode)
  align?: 'start' | 'center' | 'end'
}

export const MultipleSelectDropdown = <ColumnId extends BaseColumnId = BaseColumnId>({
  title,
  options,
  selected,
  onChange,
  className,
  trigger,
  align = 'end',
}: MultipleSelectDropdownProps<ColumnId>) => {
  const [open, setOpen] = useState(false)

  const handleItemClick = ({ id }: SelectorOption<ColumnId>): void => {
    const newSelected = selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id]
    onChange && onChange(newSelected)
  }

  const renderTrigger = (): ReactNode => {
    return typeof trigger === 'function' ? trigger(open) : trigger
  }

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen} data-testid="dropdown-selector-root">
      <DropdownMenuPrimitive.Trigger
        className="focus:outline-none focus:ring-0 cursor-pointer"
        aria-label={title}
        data-testid="dropdown-selector-trigger"
      >
        {renderTrigger()}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          asChild
          className={cn('z-[1000] min-w-[220px] rounded p-1 shadow-md')}
          sideOffset={5}
          align={align}
          role="listbox"
          aria-label={title}
          data-testid="dropdown-selector-content"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn('bg-v3-bg-accent-60 rounded shadow-lg p-6', className)}
          >
            <Label
              className="pb-2 text-v3-bg-accent-0 text-sm uppercase"
              data-testid="dropdown-selector-title"
            >
              {title}
            </Label>
            <DropdownMenuPrimitive.Group
              className="w-full"
              role="group"
              data-testid="dropdown-selector-group"
            >
              {options.map(item => (
                <DropdownMenuPrimitive.Item
                  key={String(item.id)}
                  className="outline-none"
                  onSelect={e => {
                    e.preventDefault()
                    handleItemClick(item)
                  }}
                  role="option"
                  aria-selected={selected.includes(item.id)}
                  data-testid={`dropdown-selector-item-${String(item.id)}`}
                >
                  <MultipleSelectDropdownItem
                    label={item.label}
                    sublabel={item.sublabel}
                    checked={selected.includes(item.id)}
                  />
                </DropdownMenuPrimitive.Item>
              ))}
            </DropdownMenuPrimitive.Group>
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
