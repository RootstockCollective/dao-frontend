import { ReactNode } from 'react'

import { Label } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface LabeledContentProps {
  label: string
  children: ReactNode
  className?: string
}

export const LabeledContent = ({ label, children, className }: LabeledContentProps) => {
  return (
    <div className={cn('flex flex-col', className)} data-testid="labeledContainer">
      <Label className="text-xs text-v3-bg-accent-0" data-testid="labeledTitle">
        {label}
      </Label>
      <div className="text-base text-v3-text-100 font-bold" data-testid="labeledContent">
        {children}
      </div>
    </div>
  )
}
