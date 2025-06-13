import { FC, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
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
  trigger: React.ReactNode
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

  const handleItemClick = (item: SelectorOption) => {
    let newSelected: string[]
    if (selected.includes(item.id)) {
      newSelected = selected.filter(v => v !== item.id)
    } else {
      newSelected = [...selected, item.id]
    }
    if (onChange) onChange(newSelected)
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="focus:outline-none focus:ring-0">{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-[1000] min-w-[220px] rounded p-1 shadow-md',
            'data-[side=bottom]:animate-slideUpAndFade',
            'data-[side=top]:animate-slideDownAndFade',
          )}
          sideOffset={5}
          align={align}
        >
          <div className={cn('bg-v3-bg-accent-100 rounded shadow-lg p-6', className)}>
            <Label className="pb-2 text-v3-bg-accent-0 text-sm uppercase">{title}</Label>
            <DropdownMenu.Group className="w-full">
              {options.map(item => (
                <DropdownMenu.Item
                  key={item.id}
                  className="outline-none"
                  onSelect={e => {
                    e.preventDefault()
                    handleItemClick(item)
                  }}
                >
                  <DropdownSelectorItem
                    label={item.label}
                    sublabel={item.sublabel}
                    checked={selected.includes(item.id)}
                  />
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
