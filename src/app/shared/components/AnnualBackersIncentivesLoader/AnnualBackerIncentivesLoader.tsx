import Big from 'big.js'
import { ReactNode } from 'react'

import { FIXED_ABI_PCT } from '@/lib/constants'

interface AnnualBackerIncentivesLoaderProps {
  render: (props: { data: Big; isLoading: boolean }) => ReactNode
}

/** Renders the global ABI, a fixed configurable value (`FIXED_ABI_PCT`). */
export const AnnualBackerIncentivesLoader = ({ render }: AnnualBackerIncentivesLoaderProps) => {
  return <>{render({ data: Big(FIXED_ABI_PCT), isLoading: false })}</>
}
