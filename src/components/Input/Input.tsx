import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// flex h-9 w-full rounded-md border border-input bg-transparent
// px-3 py-1 text-sm shadow-sm transition-colors file:border-0
// file:bg-transparent file:text-sm file:font-medium
// placeholder:text-muted-foreground
// focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
// disabled:cursor-not-allowed disabled:opacity-50
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

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn(DEFAULT_CLASSES, className)} ref={ref} {...props} />
})
Input.displayName = 'Input'

export { Input }
