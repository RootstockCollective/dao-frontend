import { useMemo, useState, memo, cloneElement } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Union type for all supported form elements
export type FormElementProps =
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>

// Interface extends standard label attributes
export interface FloatingLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label: string
  children: React.ReactElement<FormElementProps>
  hasValue: boolean
}

/**
 * A floating label component that wraps form inputs and textarea`s.
 * The label animates from placeholder position to floating position above the field
 * when the input is focused or has a value, similar to Material Design.
 */
export const FloatingLabel: React.FC<FloatingLabelProps> = memo(
  ({ label, hasValue, children, className, ...labelProps }) => {
    const [isFocused, setIsFocused] = useState(false)
    const isFloating = isFocused || hasValue

    // Clone child element with inline event handlers
    const childWithHandlers = useMemo(
      () =>
        cloneElement<FormElementProps>(children, {
          ...children.props,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          placeholder: '', // Remove placeholder to avoid conflicts
        }),
      [children],
    )

    return (
      <div className={cn('relative', className)}>
        {childWithHandlers}

        <motion.label
          htmlFor={labelProps.htmlFor}
          className={cn(
            'absolute left-4 top-5 pointer-events-none origin-left font-rootstock-sans text-bg-0',
          )}
          initial={false}
          animate={{
            y: isFloating ? -12 : 0,
            scale: isFloating ? 0.75 : 1, // 16px -> 12px text
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        >
          {label}
        </motion.label>
      </div>
    )
  },
)

FloatingLabel.displayName = 'FloatingLabel'
