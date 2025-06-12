// Generic DropdownSelector for v3
// Implements the UI for selection with labels and sublabels
// Handles specific labels and custom styles

import { FC } from 'react'
import { DropdownList } from './DropdownList'
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
}

export const DropdownSelector: FC<DropdownSelectorProps> = ({
  title,
  options,
  selected,
  onChange,
  className,
}) => {
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
    <div className={cn('bg-v3-bg-accent-100 rounded shadow-lg p-6 ', className)}>
      <Label className="pb-2 text-v3-bg-accent-0 text-sm uppercase">{title}</Label>
      <DropdownList
        items={options}
        onItemClick={handleItemClick}
        renderItem={item => (
          <DropdownSelectorItem
            label={item.label}
            sublabel={item.sublabel}
            checked={selected.includes(item.id)}
          />
        )}
      />
    </div>
  )
}
