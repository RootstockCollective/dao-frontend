import { cn } from '@/lib/utils'
import { CommonComponentProps } from '../commonProps'
import { Label, LabelProps } from '../Typography'

export type BarLabelProps = CommonComponentProps & LabelProps

export const BarLabel = ({ children, className }: BarLabelProps): React.ReactElement => {
  return <Label className={cn('text-v3-bg-accent-0', className)}>{children}</Label>
}
