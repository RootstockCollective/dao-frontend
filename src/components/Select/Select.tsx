import { type ReactNode, useState } from 'react'
import { motion } from 'motion/react'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectDropdownProps extends Select.SelectTriggerProps {
  /**
   * Array of options to display in the dropdown
   */
  options: string[]
  /**
   * Callback function called when the selected value changes
   * Receives empty string when deselected
   */
  onValueChange: (value: string) => void
  /**
   * Placeholder text to display when no option is selected
   */
  placeholder?: ReactNode
  /**
   * Currently selected value. Empty string or undefined for no selection
   */
  value?: string
}

const animationDuration = 0.3

/**
 * A customizable dropdown select component with smooth animations and deselect functionality.
 * Built on top of Radix UI Select with custom styling and motion effects.
 */
export function SelectDropdown({
  className,
  options = [],
  onValueChange,
  placeholder = 'Select...',
  value,
  ...props
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleOpenChange = (open: boolean) => {
    // Block changes during animation
    if (isAnimating) return
    if (open) {
      setIsOpen(true)
    } else {
      setIsAnimating(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsAnimating(false)
      }, animationDuration * 1000)
    }
  }

  const handleItemSelect = (selectedValue: string) => {
    // If clicking on already selected item, deselect it
    if (selectedValue === value) {
      onValueChange('')
    } else {
      onValueChange(selectedValue)
    }
  }
  const isVisible = isOpen && !isAnimating
  return (
    <Select.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value}
      onValueChange={handleItemSelect}
      disabled={isAnimating}
    >
      <Select.Trigger
        className={cn(
          'h-14 pl-3 w-full bg-bg-60',
          'flex items-center justify-between',
          'rounded-sm focus:outline-0', // borders
          'data-[state=open]:rounded-b-none',
          isAnimating && 'pointer-events-none',
          className,
        )}
        {...props}
      >
        <div
          className={cn('font-rootstock-sans text-text-100 select-none truncate', {
            'text-bg-0': !value,
          })}
        >
          <Select.Value placeholder={placeholder} />
        </div>
        {/* Rotating chevron in a square box */}
        <Select.Icon className="w-6 m-3 aspect-square rounded-sm bg-bg-40 text-text-100 flex items-center justify-center shrink-0">
          <motion.div animate={{ rotate: isVisible ? 180 : 0 }} transition={{ duration: animationDuration }}>
            <ChevronDown strokeWidth={2} size={20} />
          </motion.div>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          sideOffset={8}
          position="popper"
          side="bottom"
          align="start"
          alignOffset={0}
          avoidCollisions={false}
        >
          <motion.div
            className="w-[var(--radix-select-trigger-width)] bg-bg-60 rounded-b-sm"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={isVisible ? { clipPath: 'inset(0 0 0% 0)' } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: animationDuration, ease: 'easeOut' }}
          >
            <Select.Viewport className="py-2">
              {options?.map((option, i) => {
                const isSelected = value === option && value !== '' && value !== undefined
                return (
                  <Select.Item
                    disabled={isAnimating}
                    value={option}
                    key={`${option}-${i}`}
                    className={cn(
                      'px-4 py-2 h-10', // size
                      // bg highlighting
                      'hover:bg-text-80 hover:text-text-0 transition-colors duration-300 ',
                      'data-[highlighted]:bg-text-80 data-[highlighted]:text-text-0',
                      'text-text-100 font-rootstock-sans leading-none', // text
                      'flex items-center justify-between', // flex
                      'focus:outline-none hover:outline-0 cursor-pointer', // decorations
                      { 'bg-bg-40/30': isSelected },
                    )}
                  >
                    <Select.ItemText>{option}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon className="w-4 h-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                )
              })}
            </Select.Viewport>
          </motion.div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
