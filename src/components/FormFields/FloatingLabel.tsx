import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface FloatingLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label: string
  isFloating: boolean
  children: React.ReactNode
}

/**
 * A floating label component that wraps form inputs and textarea`s.
 * The label animates from placeholder position to floating position above the field
 * when the input is focused or has a value, similar to Material Design.
 */
export function FloatingLabel({ label, isFloating, children, className, ...labelProps }: FloatingLabelProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <motion.label
        htmlFor={labelProps.htmlFor}
        className={cn(
          'absolute w-[calc(100%-2rem)] left-4 top-5 pointer-events-none origin-left font-rootstock-sans text-bg-0 truncate ',
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
}
