import { formatSymbol } from '@/app/shared/formatter'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { STRIF } from '@/lib/constants'
import { BackerAnnualBackersIncentives } from './Metrics/BackerAnnualBackersIncentives'
import { Address } from 'viem'
import { useContext, useMemo } from 'react'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface Props {
  cumulativeAllocation: bigint
  hasAllocations?: boolean
}

export const TotalBackingDisplay = ({ cumulativeAllocation, hasAllocations = false }: Props) => {
  const {
    state: { allocations },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)
  const isDesktop = useIsDesktop()

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const uniqueAddresses = [...new Set([...Object.keys(initialAllocations), ...Object.keys(allocations)])]
    return uniqueAddresses.some(
      builderAddress =>
        (initialAllocations[builderAddress as Address] || 0n) !==
        (allocations[builderAddress as Address] || 0n),
    )
  }, [initialAllocations, allocations])

  const label = useMemo(() => {
    if (!hasUnsavedChanges) {
      return 'Total backing'
    }
    if (isDesktop) {
      return 'Total Future backing'
    }
    return 'Future backing'
  }, [isDesktop, hasUnsavedChanges])

  return (
    <div className="flex flex-col md:flex-row items-start basis-1/2 gap-6">
      <TokenAmountDisplay
        label={label}
        amount={formatSymbol(cumulativeAllocation, STRIF)}
        tokenSymbol={STRIF}
        isPending={hasUnsavedChanges}
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
