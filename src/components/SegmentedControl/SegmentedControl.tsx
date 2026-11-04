'use client'

import { KeyboardEvent, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name of the group. */
  label: string
  className?: string
  optionClassName?: string
  selectedOptionClassName?: string
  renderLabel?: (option: SegmentedControlOption<T>, isSelected: boolean) => React.ReactNode
}

/** Single-choice control modelled as a radio group: one tab stop, arrows move between options. */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  optionClassName,
  selectedOptionClassName,
  renderLabel,
}: SegmentedControlProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIndex = options.findIndex(option => option.value === value)
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex

  const select = (index: number) => {
    const next = options[index]
    if (!next) return

    onChange(next.value)
    containerRef.current?.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (options.length === 0) return

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      select(event.key === 'Home' ? 0 : options.length - 1)
      return
    }

    const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!offset) return

    event.preventDefault()
    select((tabbableIndex + offset + options.length) % options.length)
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('flex items-center gap-1', className)}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-value={option.value}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v3-text-100',
              optionClassName,
              isSelected && selectedOptionClassName,
            )}
          >
            {renderLabel ? renderLabel(option, isSelected) : option.label}
          </button>
        )
      })}
    </div>
  )
}
