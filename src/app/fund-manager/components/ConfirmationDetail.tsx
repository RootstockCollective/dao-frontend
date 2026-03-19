import { ReactNode } from 'react'

import { Header, Label } from '@/components/Typography'

interface Props {
  label: string
  value: string
  secondaryValue?: string
  icon?: ReactNode
}

/**
 * Label + value display for confirmation steps.
 * Uses Typography system: label with Tag variant, value with Header h1.
 */
export const ConfirmationDetail = ({ label, value, secondaryValue, icon }: Props) => (
  <div className="flex flex-col gap-2" data-testid={`ConfirmationDetail-${label}`}>
    <Label variant="tag" className="text-bg-0">
      {label}
    </Label>
    <div className="flex items-center gap-2 min-h-10">
      <Header variant="h1" className="truncate">
        {value}
      </Header>
      {icon}
    </div>
    {secondaryValue && (
      <Label variant="tag-s" className="text-bg-0">
        {secondaryValue}
      </Label>
    )}
  </div>
)
