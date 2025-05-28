import { FC, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePricesContext } from '@/shared/context/PricesContext'
import { RIF } from '@/lib/constants'
import { BuilderCard } from './BuilderCard'

interface BuilderCardProps {
  builderAddress: string
  builderName: string
  currentAllocation: number
  maxAllocation: number
  onUpdateAllocation: (newAllocation: number) => void
  builderRewardPct: number
  builderNextRewardPct?: number
  estimatedRewards?: string
  allocationTxPending?: boolean
  topBarColor: string
  dataTestId?: string
  className?: string
}

export const BuilderCardContainer: FC<BuilderCardProps> = ({
  currentAllocation,
  allocationTxPending = false,
  onUpdateAllocation,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const rifPriceUsd = prices[RIF]?.price ?? 0
  const [allocation, setAllocation] = useState<number>(currentAllocation)

  const handleAllocationChange = (value: number) => {
    if (allocationTxPending) return
    setAllocation(value)
    onUpdateAllocation(value)
  }

  const handleBuilderNameClick = () => {
    // FIXME: implement builder name click logic
    console.log('builder name clicked')
  }

  return (
    <BuilderCard
      {...props}
      isConnected={isConnected}
      rifPriceUsd={rifPriceUsd}
      allocation={allocation}
      currentAllocation={currentAllocation}
      allocationTxPending={allocationTxPending}
      onAllocationChange={handleAllocationChange}
      onBuilderNameClick={handleBuilderNameClick}
    />
  )
}
