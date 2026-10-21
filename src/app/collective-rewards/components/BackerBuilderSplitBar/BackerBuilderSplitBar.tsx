import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'

import { SPLIT_COLORS } from '../../constants/dashboardColors'
import { getSplitPercentages } from '../../utils/dashboardFormatters'

export interface BackerBuilderSplitBarProps {
  /** 0..1 */
  backersShare: number
  className?: string
}

export const BackerBuilderSplitBar = ({ backersShare, className }: BackerBuilderSplitBarProps) => {
  const { backersPct, buildersPct } = getSplitPercentages(backersShare)

  return (
    <ComparativeProgressBar
      segmented
      className={className}
      aria-label={`Backers ${backersPct}%, Builders ${buildersPct}%`}
      values={[
        { value: backersShare, color: SPLIT_COLORS.backers },
        { value: 1 - backersShare, color: SPLIT_COLORS.builders },
      ]}
    />
  )
}
