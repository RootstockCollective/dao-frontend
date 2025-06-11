// Generic DropdownSelector for v3
// Implements the UI for selection with labels and sublabels
// Handles specific labels and custom styles

import React from 'react'
import { DropdownList } from './DropdownList'
import { DropdownSelectorItem } from './DropdownSelectorItem'
import { Label } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

export interface SelectorOption {
  label: string
  value: string
  sublabel?: string
}

export interface DropdownSelectorProps {
  title: string
  options: SelectorOption[]
  selected: number[]
  onChange?: (selectedOptions: SelectorOption[], selectedIndices: number[]) => void
  className?: string
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  title,
  options,
  selected,
  onChange,
  className,
}) => {
  const handleItemClick = (item: SelectorOption, idx: number) => {
    let newSelected: number[]
    if (selected.includes(idx)) {
      newSelected = selected.filter(i => i !== idx)
    } else {
      newSelected = [...selected, idx]
    }
    if (onChange)
      onChange(
        newSelected.map(i => options[i]),
        newSelected,
      )
  }

  return (
    <div className={cn('bg-v3-bg-accent-100 rounded shadow-lg p-6 ', className)}>
      <Label className="pb-2 text-v3-bg-accent-0 text-sm uppercase">{title}</Label>
      <DropdownList
        items={options}
        onItemClick={handleItemClick}
        renderItem={(item, _, active) => (
          <DropdownSelectorItem label={item.label} sublabel={item.sublabel} checked={selected.includes(_)} />
        )}
      />
    </div>
  )
}
