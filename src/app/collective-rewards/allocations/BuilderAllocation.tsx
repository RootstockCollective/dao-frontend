import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Label } from '@/components/Typography'
import { BuilderAllocationHeader } from './BuilderAllocationHeader'
import { BuilderAllocationProps } from './types'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { useState } from 'react'
import { StakeHint } from './StakeHint'

export const BuilderAllocation = (builder: BuilderAllocationProps) => {
  const [sliderValue, setSliderValue] = useState<number>(builder.currentAllocation)
  /* TODO: when the cumulative amount exceeds the balance
   * - hint is changed
   * - Slider is hidden
   */
  const hint = `Allocation left ${formatBalanceToHuman(builder.allocationLeft.toString())} stRIF`
  // const hint = <StakeHint />
  const onInputChange = () => {
    /* TODO:
     *  - reset all the sliders to 0 when the user changes the input
     *  - update the cumulative amount
     *  - if the cumulative amount exceeds the total allocation, show an error message in the current input
     */
  }
  return (
    <div className="flex flex-col py-4 px-2 gap-6 shrink-0 bg-foreground max-w-[calc(25%-1rem)]">
      <BuilderAllocationHeader {...builder} />
      <Label className="font-bold">Backer rewards {builder.backerRewards}% </Label>
      <Input type="number" name={`allocation-${builder.address}`} hint={hint} onChange={onInputChange} />
      <Slider value={[sliderValue]} />
    </div>
  )
}
