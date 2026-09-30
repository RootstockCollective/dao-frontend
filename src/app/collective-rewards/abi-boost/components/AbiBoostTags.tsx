import { Sparkles } from 'lucide-react'
import { ReactNode } from 'react'

import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { BELOW_THRESHOLD_LABEL } from '../abiBoost.labels'
import { AbiBoostStatus } from '../abiBoost.utils'
import { useAbiBoostPosition } from '../hooks/useAbiBoost'
import { withAbiBoostFlag } from './withAbiBoostFlag'

const TAG_BASE =
  'inline-flex w-fit items-center gap-1.5 rounded-full border font-rootstock-sans leading-none whitespace-nowrap'

interface TagProps {
  children: ReactNode
  className?: string
  'data-testid'?: string
}

/** Orange pill for everything the boost is doing, or is about to do, for the wallet. */
export const BoostPill = ({ children, className, 'data-testid': dataTestId = 'BoostPill' }: TagProps) => (
  <span
    className={cn(
      TAG_BASE,
      'border-v3-primary/50 bg-v3-primary/10 px-3 py-1.5 text-sm text-v3-primary',
      className,
    )}
    data-testid={dataTestId}
  >
    <Sparkles size={14} aria-hidden="true" />
    {children}
  </span>
)

/** Discreet tag for a backing that exists but earns no boost because it is under the minimum. */
export const BelowThresholdTag = ({ className }: { className?: string }) => (
  <span
    className={cn(TAG_BASE, 'border-v3-text-100/20 px-2 py-1 text-xs text-v3-text-60', className)}
    data-testid="BelowThresholdTag"
  >
    {BELOW_THRESHOLD_LABEL}
  </span>
)

const STATUS_TONES: Record<AbiBoostStatus, string> = {
  notEligible: 'border-v3-text-100/20 text-v3-text-60',
  eligible: 'border-v3-text-100/25 text-v3-text-80',
  active: 'border-v3-primary/60 text-v3-primary',
}

/** Small outlined chip coloured by the wallet's boost status: the header badge and the card's chip. */
export const AbiBoostStatusChip = ({
  status,
  children,
  'data-testid': dataTestId,
}: TagProps & { status: AbiBoostStatus }) => (
  <span className={cn(TAG_BASE, 'px-2.5 py-1 text-xs', STATUS_TONES[status])} data-testid={dataTestId}>
    {children}
  </span>
)

const BADGE_LABELS: Record<Exclude<AbiBoostStatus, 'notEligible'>, string> = {
  eligible: 'Boost eligible',
  active: 'Boost active',
}

const AbiBoostBadgeContent = () => {
  const { status, isReady } = useAbiBoostPosition()
  if (!isReady || status === 'notEligible') return null
  return (
    <AbiBoostStatusChip status={status} data-testid="AbiBoostBadge">
      {BADGE_LABELS[status]}
    </AbiBoostStatusChip>
  )
}

/** Boost standing next to the account address in the header. */
export const AbiBoostBadge = withAbiBoostFlag(AbiBoostBadgeContent)

interface AbiBoostRowProps {
  label: ReactNode
  children: ReactNode
  /** Optional info icon next to the label. */
  info?: ReactNode
  /** `body` in modals, `body-s` in the denser card. */
  size?: 'body' | 'body-s'
  className?: string
}

/** Label on the left, value on the right, a hairline under: the rows of the boost card and modals. */
export const AbiBoostRow = ({ label, children, info, size = 'body', className }: AbiBoostRowProps) => (
  <div className={cn('flex items-center justify-between gap-6 border-b border-bg-40 py-3', className)}>
    <div className="flex items-center gap-2">
      <Span variant={size} className="text-text-60">
        {label}
      </Span>
      {info}
    </div>
    <Span variant={size} className="text-right">
      {children}
    </Span>
  </div>
)
