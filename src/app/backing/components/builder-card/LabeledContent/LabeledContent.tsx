import { Label } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface LabeledContentProps {
  label: string
  children: ReactNode
  className?: string
}

export const LabeledContent: FC<LabeledContentProps> = ({ label, children, className }) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <Label className="text-xs text-[#B0B0B0]">{label}</Label>
      <div className="text-base text-white font-bold">{children}</div>
    </div>
  )
}
