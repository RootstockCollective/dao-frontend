import * as React from 'react'

import { cn } from '@/lib/utils'
import { useFormField } from '../Form'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const DEFAULT_CLASSES = `
flex w-full
px-[20px] py-[12px]
text-black bg-input-bg
text-text-primary
rounded-md
border-[1px]
border-[white]/[0.10]
placeholder:text-input-placeholder
focus:outline-none
focus-visible:ring-1 focus-visible:ring-ring
focus-visible:ring-white focus-visible:ring-opacity-50
disabled:cursor-not-allowed disabled:opacity-50
`

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()
  return (
    <textarea
      id={formItemId}
      className={cn(DEFAULT_CLASSES, error && 'border-st-error focus-visible:ring-0', className)}
      ref={ref}
      rows={10}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
