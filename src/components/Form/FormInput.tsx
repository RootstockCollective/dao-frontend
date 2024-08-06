import * as React from 'react'

import { cn } from '@/lib/utils'
import { useFormField } from '.'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const FORM_INPUT_DEFAULT_CLASSES = `
flex w-full
p-[12px]
justify-between
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

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({ className, type, ...props }, ref) => {
  const { error, formItemId } = useFormField()
  return (
    <input
      id={formItemId}
      className={cn(FORM_INPUT_DEFAULT_CLASSES, error && 'border-st-error focus-visible:ring-0', className)}
      ref={ref}
      type={type}
      {...props}
    />
  )
})
FormInput.displayName = 'FormInput'

export { FormInput }
