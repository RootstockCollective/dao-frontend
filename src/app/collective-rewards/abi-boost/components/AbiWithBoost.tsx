import { ReactNode } from 'react'

import Big from '@/lib/big'

import { getBoostedRate } from '../abiBoost.utils'
import { useIsBackingBoosted } from '../hooks/useBackingBoostChange'

interface AbiWithBoostProps {
  abi: Big
  suffix?: ReactNode
}

// The boosted figure keeps one decimal, like every other rate with the boost, so the half point shows
export const AbiWithBoost = ({ abi, suffix }: AbiWithBoostProps) => (
  <>
    {useIsBackingBoosted() ? (
      <span className="text-v3-primary" data-testid="AbiWithBoost">
        {getBoostedRate(abi).toFixed(1)}
      </span>
    ) : (
      abi.toFixed(0)
    )}
    {suffix}
  </>
)
