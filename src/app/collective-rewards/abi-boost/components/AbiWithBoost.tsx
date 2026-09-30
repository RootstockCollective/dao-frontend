import { ReactNode } from 'react'

import Big from '@/lib/big'

import { formatRate, getBoostedRate } from '../abiBoost.utils'
import { useIsBackingBoosted } from '../hooks/useBackingBoostChange'

interface AbiWithBoostProps {
  /** The ABI this figure shows, which the boost is added to. */
  abi: Big
  /** The figure as it reads without the boost. */
  children: ReactNode
}

/**
 * An ABI figure that turns into that same ABI plus the boost once the backing reaches the minimum,
 * saved or being edited. The boost is added to the ABI the figure already shows, so a backer's own
 * estimate stays theirs instead of being swapped for the Collective's.
 */
export const AbiWithBoost = ({ abi, children }: AbiWithBoostProps) =>
  useIsBackingBoosted() ? (
    <span className="text-v3-primary" data-testid="AbiWithBoost">
      {formatRate(getBoostedRate(abi))}
    </span>
  ) : (
    <>{children}</>
  )
