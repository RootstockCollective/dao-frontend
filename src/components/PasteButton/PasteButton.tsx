import React, { HTMLAttributes } from 'react'
import { Typography } from '../Typography'
import { cn } from '@/lib/utils/utils'

interface PasteButtonProps extends HTMLAttributes<HTMLElement> {
  handlePaste: (val: string) => void
}

/**
 * PasteButton – a wrapper component that allows pasting text from the clipboard.
 * On click, it retrieves text from `navigator.clipboard` and passes it to `handlePaste`.
 *
 * Note: The "Paste" button is absolutely positioned inside a `relative` container.
 * To adjust its position, use `className` with Tailwind's absolute positioning utilities (e.g., `right-3 top-12`).
 *
 * Example:
 * ```jsx
 * <PasteButton handlePaste={handlePaste} className="right-3 top-12">
 *   <input />
 * </PasteButton>
 * ```
 */
export function PasteButton({ handlePaste, children, className, ...props }: PasteButtonProps) {
  const clipboardPaste = async () => {
    const text = await navigator.clipboard.readText()
    handlePaste(text)
  }
  return (
    <div className="relative">
      {children}
      <Typography
        {...props}
        onClick={clipboardPaste}
        className={cn('absolute text-primary cursor-pointer', className)}
      >
        Paste
      </Typography>
    </div>
  )
}
