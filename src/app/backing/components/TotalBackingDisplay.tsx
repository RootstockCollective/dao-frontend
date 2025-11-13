import { formatSymbol } from '@/app/shared/formatter'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { STRIF } from '@/lib/constants'
import { BackerAnnualBackersIncentives } from './Metrics/BackerAnnualBackersIncentives'
import { Address } from 'viem'
import { useContext, useMemo } from 'react'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

interface Props {
  cumulativeAllocation: bigint
  hasAllocations: boolean
}

export const TotalBackingDisplay = ({ cumulativeAllocation, hasAllocations }: Props) => {
  const {
    state: { allocations },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const uniqueAddresses = [...new Set([...Object.keys(initialAllocations), ...Object.keys(allocations)])]
    return uniqueAddresses.some(
      builderAddress =>
        (initialAllocations[builderAddress as Address] || 0n) !==
        (allocations[builderAddress as Address] || 0n),
    )
  }, [initialAllocations, allocations])

  return (
    <div className="flex flex-col md:flex-row items-start basis-1/2">
      <TokenAmountDisplay
        label={hasUnsavedChanges ? 'Future total backing' : 'Total backing'}
        amount={formatSymbol(cumulativeAllocation, STRIF)}
        tokenSymbol={STRIF}
        isFlexEnd
        pending={hasUnsavedChanges}
      />
      {hasAllocations && (
        <div className="basis-1/2">
          <BackerAnnualBackersIncentives />
        </div>
      )}
    </div>
  )
}
