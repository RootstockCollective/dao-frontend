import { Label } from '@/components/TypographyNew'
import { cn } from '@/lib/utils/utils'
import { FC, ReactNode } from 'react'

interface LabeledContentProps {
  label: string
  children: ReactNode
  className?: string
}

export const LabeledContent: FC<LabeledContentProps> = ({ label, children, className }) => {
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
