'use client'

import { Button, ButtonProps } from '@/components/Button'
import { Input } from '@/components/Input'
import { Label } from '@/components/Typography'

const PercentageButton = ({ children, ...rest }: ButtonProps) => (
  <Button variant="secondary" className="px-2 py-1" {...rest}>
    {children}
  </Button>
)

export const AllocationAmount = () => {
  return (
    <div className="flex flex-col items-end gap-4 min-w-[694px] h-[130px]">
      <div className="flex flex-col items-center gap-[10px] self-stretch">
        <Label className="w-full text-base leading-4">Set amount to allocate</Label>
        {/* TODO:
          - I may need to change this with a form input 
          - input length should be 100% of the parent container
          */}
        <Input className="w-full" name="amountToAllocate" />
      </div>
      <div className="flex items-center gap-3">
        <PercentageButton>10%</PercentageButton>
        <PercentageButton variant="secondary" className="px-2 py-1">
          20%
        </PercentageButton>
        <PercentageButton variant="secondary" className="px-2 py-1">
          50%
        </PercentageButton>
        <PercentageButton variant="secondary" className="px-2 py-1">
          100%
        </PercentageButton>
      </div>
    </div>
  )
}
