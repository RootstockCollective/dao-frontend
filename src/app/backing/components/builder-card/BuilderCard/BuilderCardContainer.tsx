import { FC, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePricesContext } from '@/shared/context/PricesContext'
import { RIF } from '@/lib/constants'
import { BuilderCard, BuilderCardProps } from './BuilderCard'

interface BuilderCardContainerProps extends BuilderCardProps {
  onUpdateAllocation: (newAllocation: number) => void
}

export const BuilderCardContainer: FC<BuilderCardContainerProps> = ({
  existentAllocation,
  allocationTxPending = false,
  onUpdateAllocation,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const rifPriceUsd = prices[RIF]?.price ?? 0
  const [allocation, setAllocation] = useState<number>(existentAllocation)

  const handleAllocationChange = (value: number) => {
    if (allocationTxPending) return
    setAllocation(value)
    onUpdateAllocation(value)
  }

  return (
    <BuilderCard
      {...props}
      isConnected={isConnected}
      rifPriceUsd={rifPriceUsd}
      allocation={allocation}
      existentAllocation={existentAllocation}
      allocationTxPending={allocationTxPending}
      onAllocationChange={handleAllocationChange}
    />
  )
}
