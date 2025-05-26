import { Button } from '@/components/Button'
import { FC, useState } from 'react'
import { AllocationInput } from '../AllocationInput/AllocationInput'
import { BuilderHeader } from '../BuilderHeader/BuilderHeader'
import { CurrentBacking } from '../CurrentBacking/CurrentBacking'
import { RewardsInfo } from '../RewardsInfo/RewardsInfo'
import { useAccount } from 'wagmi'
import { BuilderActionButton } from '../BuilderActionButton/BuilderActionButton'

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
}

export const BuilderCard: FC<BuilderCardProps> = ({
  builderAddress,
  builderName,
  currentAllocation,
  maxAllocation,
  builderRewardPct,
  builderNextRewardPct,
  estimatedRewards,
  allocationTxPending = false,
  onUpdateAllocation,
  topBarColor,
}) => {
  const { isConnected } = useAccount()
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
    <div className="rounded bg-[#37322F] px-2 flex flex-col items-center w-[260px] relative">
      <div
        className="absolute top-0 left-0 w-full h-[8px] rounded-t"
        style={{ backgroundColor: topBarColor }}
      />
      <BuilderHeader
        address={builderAddress}
        name={builderName}
        onNameClick={handleBuilderNameClick}
        className="mt-8"
      />
      <div className="w-full mt-6 border border-[#66605C] rounded-lg gap-3 flex flex-col divide-y divide-[#66605C]">
        <RewardsInfo
          builderRewardPct={builderRewardPct}
          builderNextRewardPct={builderNextRewardPct}
          estimatedRewards={estimatedRewards}
        />
        {isConnected && (
          <AllocationInput
            allocation={allocation}
            maxAllocation={maxAllocation}
            currentAllocation={currentAllocation}
            allocationTxPending={allocationTxPending}
            onAllocationChange={handleAllocationChange}
            className="px-2 py-3 mx-3"
          />
        )}
        {isConnected && <CurrentBacking currentAllocation={currentAllocation} />}
      </div>
      {isConnected && currentAllocation !== 0 && (
        <BuilderActionButton onClick={() => handleAllocationChange(0)} text="Remove backing" />
      )}
      {!isConnected && (
        <BuilderActionButton onClick={() => handleAllocationChange(allocation)} text="Back builder" />
      )}
    </div>
  )
}
