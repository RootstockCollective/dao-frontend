import { formatSymbol } from '@/app/shared/formatter'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { STRIF } from '@/lib/constants'
import { BackerAnnualBackersIncentives } from './Metrics/BackerAnnualBackersIncentives'

interface Props {
  cumulativeAllocation: bigint
  hasAllocations: boolean
}

export const TotalBackingDisplay = ({ cumulativeAllocation, hasAllocations }: Props) => {
  return (
    <div className="flex flex-col md:flex-row items-start basis-1/2">
      <TokenAmountDisplay
        label="Total backing"
        amount={formatSymbol(cumulativeAllocation, STRIF)}
        tokenSymbol={STRIF}
        isFlexEnd
      />
      {hasAllocations && (
        <div className="basis-1/2">
          <BackerAnnualBackersIncentives />
        </div>
      )}
    </div>
  )
}
