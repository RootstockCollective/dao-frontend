import type { FC, JSX } from 'react'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import type { DisplayStatus, DisplayStatusLabel } from '../../services/ui/types'

const BADGE_STYLES: Record<DisplayStatus, string> = {
  open_to_claim: 'bg-brand-rootstock-lime text-text-0',
  pending: 'bg-st-info text-text-0',
  claim_pending: 'bg-brand-rootstock-purple text-text-0',
  successful: 'bg-success text-text-0',
  cancelled: 'bg-bg-40',
  rejected: 'bg-error text-text-0',
}

interface Props extends Omit<JSX.IntrinsicElements['div'], 'children'> {
  displayStatus: DisplayStatus
  label: DisplayStatusLabel
}

export const RequestStatusBadge: FC<Props> = ({ displayStatus, label, className, ...props }) => {
  return (
    <div
      className={cn(
        'px-2 py-[3px] inline-flex items-center justify-center rounded-full text-text-100 overflow-hidden',
        BADGE_STYLES[displayStatus],
        className,
      )}
      data-testid="request-status-badge"
      {...props}
    >
      <Paragraph className="whitespace-nowrap text-[clamp(10px,1.1vw,12px)]">{label}</Paragraph>
    </div>
  )
}
