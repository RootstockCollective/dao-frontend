import { HTMLAttributes, useState } from 'react'
import {
  Root,
  SelectTrigger,
  SelectContent,
  SelectViewport,
  SelectIcon,
  SelectItem,
  SelectItemText,
} from '@radix-ui/react-select'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderTitle, Typography } from '@/components/Typography'
import { dropdownItemsData } from './dropdown-items-data'

const dropdownTitle = 'Prepare your proposal'

export function PrepareProposalDropdown({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const [selectedLink, setSelectedLink] = useState<string>('')

  const handleSelect = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
    setSelectedLink('')
  }
  const [isOpen, setIsOpen] = useState(false)
  const closeDropdown = () => setIsOpen(false)

  return (
    <div {...props} className={cn(className, ' w-full max-w-[380px]')}>
      <Root open={isOpen} onOpenChange={setIsOpen} value={selectedLink} onValueChange={handleSelect}>
        <SelectTrigger
          aria-label={dropdownTitle}
          aria-expanded={isOpen}
          className={cn(
            'w-full h-12 px-5 flex items-center justify-between bg-[#E4E1DA] rounded-[4px] focus:outline-none',
            isOpen ? 'opacity-0' : 'opacity-100',
          )}
        >
          <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">
            {dropdownTitle}
          </HeaderTitle>
          <SelectIcon>
            <ChevronDown className="text-black" />
          </SelectIcon>
        </SelectTrigger>

        <SelectContent
          position="popper"
          align="center"
          side="top"
          sideOffset={-48}
          className="pt-6 pb-4 w-[380px] bg-[#E4E1DA] rounded-[4px] overflow-hidden z-10"
        >
          <div className="px-5">
            <div className="flex items-center justify-between">
              <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">
                {dropdownTitle}
              </HeaderTitle>
              <X className="text-black cursor-pointer" onClick={closeDropdown} />
            </div>

            <Typography className="mt-4 w-[296px] text-[#666057] text-[15px] leading-snug ">
              If these steps are not completed, your proposal is unlikely to reach quorum and succeed in a
              vote.
            </Typography>
          </div>

          <SelectViewport className="mt-4 flex flex-col">
            {dropdownItemsData.map(({ Icon, text, title, id, linkUrl }) => (
              <SelectItem key={id} value={linkUrl} className="outline-none hover:cursor-pointer">
                <div className="px-5 py-3 w-full flex items-center gap-3 hover:bg-gray-100">
                  <div className="flex items-center justify-center">
                    <Icon />
                  </div>
                  <div className="flex-grow flex flex-col gap-1">
                    <SelectItemText>
                      <Typography className="text-[15px] leading-none text-[#171412]">{title}</Typography>
                    </SelectItemText>
                    <SelectItemText>
                      <Typography className="max-w-[230px] text-[12px] leading-none text-[#66605C]">
                        {text}
                      </Typography>
                    </SelectItemText>
                  </div>
                  <div>
                    <ChevronRight strokeWidth={1.5} color="black" />
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectViewport>
        </SelectContent>
      </Root>
    </div>
  )
}
