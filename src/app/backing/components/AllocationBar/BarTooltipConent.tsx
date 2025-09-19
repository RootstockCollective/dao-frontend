import { CommonComponentProps } from '@/components/commonProps'
import { Label } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ReactElement } from 'react'

export const BarTooltip = ({ children, className }: CommonComponentProps): ReactElement => {
  return (
    <div className={cn('flex flex-col gap-2 h-40 items-end self-stretch bg-transparent', className)}>
      {children}
    </div>
  )
}

export const BarTooltipConent = ({ children, className }: CommonComponentProps): ReactElement => {
  return (
    <div
      className={cn('w-fit p-4 bg-v3-text-80 rounded flex items-end gap-2 text-v3-bg-accent-100', className)}
    >
      {children}
    </div>
  )
}

export const BarTooltipLabels = ({ children, className }: CommonComponentProps): ReactElement => {
  return <div className={cn('flex flex-col items-start gap-1', className)}>{children}</div>
}

export const BarTooltipLabelItem = ({ children }: CommonComponentProps) => {
  return (
    <Label variant="body-xs" className="font-medium leading-5">
      {children}
    </Label>
  )
}

export const BarTooltipValues = ({
  label,
  children,
  className,
}: CommonComponentProps & { label: string }): ReactElement => {
  return (
    <div className={cn('flex flex-col justify-center items-start gap-1', className)}>
      <Label variant="body-xs" className="font-medium leading-5">
        {label}
      </Label>
      {children}
    </div>
  )
}

export const BarTooltipValueItem = ({ children }: CommonComponentProps) => {
  return (
    <Label variant="body-xs" className="flex items-center gap-1 leading-5">
      {children}
    </Label>
  )
}
