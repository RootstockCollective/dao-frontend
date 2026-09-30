import { ReactNode } from 'react'

import Big from '@/lib/big'

import { formatRate, getBoostedRate } from '../abiBoost.utils'
import { useIsBackingBoosted } from '../hooks/useBackingBoostChange'

interface AbiWithBoostProps {
  abi: Big
  children: ReactNode
}

export const AbiWithBoost = ({ abi, children }: AbiWithBoostProps) =>
  useIsBackingBoosted() ? (
    <span className="text-v3-primary" data-testid="AbiWithBoost">
      {formatRate(getBoostedRate(abi))}
    </span>
  ) : (
    <>{children}</>
  )
