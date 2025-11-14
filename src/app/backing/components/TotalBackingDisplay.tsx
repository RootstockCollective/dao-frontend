import { formatSymbol } from '@/app/shared/formatter'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { STRIF } from '@/lib/constants'
import { BackerAnnualBackersIncentives } from './Metrics/BackerAnnualBackersIncentives'
import { useContext, useMemo } from 'react'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

interface Props {
  cumulativeAllocation: bigint
  amountInCurrency?: string
  hasAllocations?: boolean
}

export const TotalBackingDisplay = ({
  cumulativeAllocation,
  amountInCurrency,
  hasAllocations = false,
}: Props) => {
  const {
    state: { allocations, isAllocationTxPending },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)

  const currentAllocation = useMemo(() => {
    return Object.entries(allocations).reduce((acc, [builderAddress, allocation]) => {
      return acc + allocation
    }, 0n)
  }, [allocations])

  const futureAllocation = useMemo(() => {
    return Object.entries(initialAllocations).reduce((acc, [builderAddress, allocation]) => {
      return acc + allocation
    }, 0n)
  }, [initialAllocations])

  const hasUnsavedChanges = useMemo(() => {
    return currentAllocation !== futureAllocation
  }, [currentAllocation, futureAllocation])

  const label = useMemo(() => {
    if (hasUnsavedChanges) {
      return 'Future backing'
    }
    return 'Total backing'
  }, [hasUnsavedChanges])

  const status = useMemo(() => {
    if (!hasUnsavedChanges) {
      return undefined
    }
    if (isAllocationTxPending) {
      return 'pending'
    }
    if (currentAllocation > futureAllocation) {
      return 'increasing'
    }
    return 'decreasing'
  }, [hasUnsavedChanges, currentAllocation, futureAllocation, isAllocationTxPending])

  return (
    <div className="flex flex-col md:flex-row items-start basis-1/2 gap-6">
      <TokenAmountDisplay
        label={label}
        amount={formatSymbol(cumulativeAllocation, STRIF)}
        tokenSymbol={STRIF}
        status={status}
        amountInCurrency={amountInCurrency}
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
