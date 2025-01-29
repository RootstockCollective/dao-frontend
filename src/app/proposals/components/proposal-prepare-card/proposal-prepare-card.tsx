import React, { HTMLAttributes } from 'react'
import {
  Root,
  SelectTrigger,
  type SelectTriggerProps,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderTitle, Typography } from '@/components/Typography'

export function ProposalPrepareCard({ className, ...props }: SelectTriggerProps) {
  return (
    <Root>
      <SelectTrigger
        {...props}
        aria-label="Prepare your proposal"
        className={cn(
          className,
          // focus:outline-none
          'w-full max-w-96 h-12 px-5 flex items-center justify-between bg-[#E4E1DA] rounded-[4px]',
        )}
      >
        <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">
          Prepare your proposal
        </HeaderTitle>
        <ChevronDown className="text-black" />
      </SelectTrigger>
    </Root>
  )
}
