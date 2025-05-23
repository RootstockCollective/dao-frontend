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
import Big from '@/lib/big'

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
    try {
      Big.strict = true
      const bigValue = Big(value)
      updateAllocation(address, BigInt(bigValue.toFixed(0)))
    } catch (e) {
      console.warn('An error occurred while transforming onSliderValueChange value to Big')
      // Defaulting to fallback behavior...
      updateAllocation(address, BigInt(value))
    } finally {
      // This is to avoid setting strict globally
      Big.strict = false
    }
  }

  const amountToAllocateBig = Big((amountToAllocate || 0n).toString())
  // We will not throw a warning on those. Only on the onSliderChange which will land us here
  const sliderValue = Big((currentAllocation || 0n).toString()).toNumber()
  const sliderMax = amountToAllocateBig.eq(0) ? 1 : amountToAllocateBig.toNumber()

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
      <Slider value={[sliderValue]} max={sliderMax} onValueChange={onSliderValueChange} />
    </div>
  )
}
