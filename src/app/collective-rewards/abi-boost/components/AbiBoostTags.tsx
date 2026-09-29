import { Sparkles } from 'lucide-react'
import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { BELOW_THRESHOLD_LABEL } from '../abiBoost.labels'
import { AbiBoostStatus } from '../abiBoost.utils'
import { useAbiBoostPosition, useIsAbiBoostEnabled } from '../hooks/useAbiBoost'

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

const BADGE_LABELS: Record<Exclude<AbiBoostStatus, 'notEligible'>, string> = {
  eligible: 'Boost eligible',
  active: 'Boost active',
}

export const AbiBoostBadgeView = ({ status }: { status: Exclude<AbiBoostStatus, 'notEligible'> }) => (
  <span
    className={cn(
      TAG_BASE,
      'px-2 py-1 text-xs',
      status === 'active' ? 'border-v3-primary/60 text-v3-primary' : 'border-v3-text-100/25 text-v3-text-60',
    )}
    data-testid="AbiBoostBadge"
  >
    {BADGE_LABELS[status]}
  </span>
)

const AbiBoostBadgeContent = () => {
  const { status, isLoading } = useAbiBoostPosition()
  if (isLoading || status === 'notEligible') return null
  return <AbiBoostBadgeView status={status} />
}

/** Boost standing next to the account address in the header. */
export const AbiBoostBadge = () => (useIsAbiBoostEnabled() ? <AbiBoostBadgeContent /> : null)
