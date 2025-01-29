import React, { HTMLAttributes } from 'react'
import {
  Root,
  SelectTrigger,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from '@radix-ui/react-select'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderTitle, Typography } from '@/components/Typography'

const title = 'Prepare your proposal'

export function PrepareProposalDropdown({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn(className, 'relative w-full max-w-[380px]')}>
      <Root>
        <SelectTrigger
          aria-label={title}
          className="w-full h-12 px-5 flex items-center justify-between bg-[#E4E1DA] rounded-[4px] focus:outline-none"
        >
          <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">{title}</HeaderTitle>
          <ChevronDown className="text-black" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent
            position="popper"
            side="bottom"
            align="center"
            className="w-full h-[273px] max-w-[380px] px-5 py-7 bg-[#E4E1DA] rounded-[4px]"
          >
            <SelectViewport>
              <div className="mb-2 flex items-center justify-between">
                <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">
                  {title}
                </HeaderTitle>
                <X className="text-black" />
              </div>

              <Typography className="w-[296px] text-[#666057] leading-[19.5px] text-[15px]">
                If these steps are not completed, your proposal is unlikely to reach quorum and succeed in a
                vote.
              </Typography>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Root>
    </div>
  )
}
