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
  /** Names the group for screen readers, e.g. "Chart range". */
  label: string
  className?: string
  optionClassName?: string
  selectedOptionClassName?: string
  renderLabel?: (option: SegmentedControlOption<T>, isSelected: boolean) => React.ReactNode
}

/**
 * A single-choice control.
 *
 * Modelled as a radio group rather than a row of `aria-pressed` buttons: the options are
 * mutually exclusive, and `aria-pressed` announces independent toggles. That also means the
 * group takes one tab stop and moves between options with the arrow keys, instead of adding
 * one stop per option.
 */
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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!offset) return

    event.preventDefault()
    const currentIndex = options.findIndex(option => option.value === value)
    const next = options[(currentIndex + offset + options.length) % options.length]

    onChange(next.value)
    // Focus follows selection, as the radio group pattern expects.
    containerRef.current?.querySelector<HTMLElement>(`[data-value="${next.value}"]`)?.focus()
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('flex items-center gap-1', className)}
    >
      {options.map(option => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-value={option.value}
            // Roving tabindex: the group is a single stop, arrows move within it.
            tabIndex={isSelected ? 0 : -1}
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
