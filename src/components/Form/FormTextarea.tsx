import * as React from 'react'

import { cn } from '@/lib/utils/utils'
import { useFormField } from '.'

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const DEFAULT_CLASSES = `
flex w-full
p-[12px]
justify-between
text-black bg-input-bg
text-text-primary
rounded-md
border-[1px]
border-[white]/[0.10]
placeholder:text-input-placeholder
focus:outline-hidden
focus-visible:ring-1 focus-visible:ring-ring
focus-visible:ring-white/50
disabled:cursor-not-allowed disabled:opacity-50
`

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, ...props }, ref) => {
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
  },
)
FormTextarea.displayName = 'FormTextarea'

export { FormTextarea }
