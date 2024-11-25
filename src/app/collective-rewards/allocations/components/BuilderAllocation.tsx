import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Builder } from '@/app/collective-rewards/types'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Label } from '@/components/Typography'
import { useContext } from 'react'
import { parseEther } from 'viem'
import { BuilderAllocationHeader, BuilderAllocationHeaderProps } from './BuilderAllocationHeader'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { weiToPercentage } from '@/app/collective-rewards/settings'
import { formatOnchainFraction } from '@/app/collective-rewards/rewards'

export type BuilderAllocationProps = BuilderAllocationHeaderProps &
  Pick<Builder, 'backerRewardPercentage'> & {
    index: number
    currentAllocation: bigint
  }

export const BuilderAllocation = (builder: BuilderAllocationProps) => {
  const {
    state: {
      backer: { amountToAllocate, cumulativeAllocation },
    },
    actions: { updateAllocation },
  } = useContext(AllocationsContext)
  const allocationLeft = amountToAllocate - cumulativeAllocation
  const { currentAllocation, backerRewardPercentage, address } = builder
  const onInputChange = (value: string) => {
    updateAllocation(builder.index, parseEther(value))
  }

  const onSliderValueChange = (value: number[]) => {
    updateAllocation(builder.index, BigInt(value[0]))
  }

  return (
    <div className="flex flex-col py-4 px-2 gap-6 shrink-0 bg-foreground rounded-[8px] min-w-[calc(25%-2rem)] max-w-[25%-1rem]">
      <BuilderAllocationHeader {...builder} />
      <Label className="font-bold">
        Backer rewards {weiToPercentage(backerRewardPercentage?.previous ?? 0n, 0)}%{' '}
      </Label>
      <Input
        type="number"
        name={`allocation-${address}`}
        hint={`Allocation left ${allocationLeft > 0 ? formatOnchainFraction(allocationLeft) : '0'} stRIF`}
        onChange={onInputChange}
        value={formatOnchainFraction(currentAllocation || 0n)}
      />
      <Slider
        value={[Number(currentAllocation)]}
        max={Number(amountToAllocate)}
        onValueChange={onSliderValueChange}
      />
    </div>
  )
}
