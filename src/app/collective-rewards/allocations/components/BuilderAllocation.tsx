import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol } from '@/app/collective-rewards/rewards'
import { weiToPercentage } from '@/app/collective-rewards/settings'
import { Builder } from '@/app/collective-rewards/types'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Label } from '@/components/Typography'
import { useContext } from 'react'
import { parseEther } from 'viem'
import { BuilderAllocationHeader, BuilderAllocationHeaderProps } from './BuilderAllocationHeader'

export type BuilderAllocationProps = BuilderAllocationHeaderProps &
  Pick<Builder, 'backerRewardPercentage'> & {
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
    updateAllocation(address, parseEther(value))
  }

  const onSliderValueChange = ([value]: number[]) => {
    updateAllocation(address, BigInt(value))
  }

  return (
    <div className="flex flex-col py-4 px-2 gap-6 shrink-0 bg-foreground rounded-[8px] min-w-[calc(25%-2rem)] max-w-[25%-1rem]">
      <BuilderAllocationHeader {...builder} />
      <Label className="font-bold">
        Backer rewards {weiToPercentage(backerRewardPercentage?.active ?? 0n, 0)}%{' '}
      </Label>
      <Input
        type="number"
        name={`allocation-${address}`}
        hint={`Allocation left ${formatSymbol(allocationLeft, 'stRIF')} stRIF`}
        onChange={onInputChange}
        value={formatSymbol(currentAllocation || 0n, 'stRIF')}
      />
      <Slider
        value={[Number(currentAllocation || 0n)]}
        max={Number(amountToAllocate || 0n) === 0 ? 1 : Number(amountToAllocate || 0n)}
        onValueChange={onSliderValueChange}
      />
    </div>
  )
}
