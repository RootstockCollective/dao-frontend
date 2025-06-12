// Generic DropdownList for v3
// Renders a list of items (could be checkboxes, radios, or plain)
// Handles keyboard navigation, focus management, and accessibility
// Accepts a render prop or children for custom item rendering

import { useRef, useEffect, useState, ReactNode, KeyboardEvent } from 'react'

export interface DropdownListProps<T> {
  items: T[]
  renderItem: (item: T, index: number, active: boolean) => ReactNode
  onItemClick?: (item: T, index: number) => void
  className?: string
}

export function DropdownList<T>({ items, renderItem, onItemClick, className }: DropdownListProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  // Focus the active item
  useEffect(() => {
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.focus()
    }
  }, [activeIndex])

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex(prev => (prev + 1) % items.length)
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(prev => (prev - 1 + items.length) % items.length)
      e.preventDefault()
    } else if (e.key === 'Enter') {
      if (onItemClick) onItemClick(items[activeIndex], activeIndex)
      e.preventDefault()
    } else if (e.key === 'Escape') {
      // Let parent handle closing
      e.stopPropagation()
    }
  }

  return (
    <ul
      ref={listRef}
      className={className}
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-activedescendant={`dropdown-item-${activeIndex}`}
    >
      {items.map((item, idx) => (
        <li
          key={idx}
          id={`dropdown-item-${idx}`}
          ref={el => {
            itemRefs.current[idx] = el
          }}
          tabIndex={-1}
          role="option"
          aria-selected={activeIndex === idx}
          onClick={() => onItemClick && onItemClick(item, idx)}
        >
          {renderItem(item, idx, activeIndex === idx)}
        </li>
      ))}
    </ul>
  )
}
