import { HTMLAttributes, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderTitle, Typography } from '@/components/Typography'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { dropdownItemsData } from './data'

/**
 * "Prepare Your Proposal" custom dropdown menu with smooth animation
 */
export function PrepareProposalDropdown({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  // Closes the dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null)
  useClickOutside([dropdownRef], close)

  const openLink = (link: string) => {
    close()
    // Timeout ensures the menu closes before opening the link to prevent UI glitches.
    setTimeout(() => {
      window.open(link, '_blank', 'noopener,noreferrer')
    }, 200)
  }

  return (
    <div {...props} ref={dropdownRef} className={cn(className, 'relative w-full max-w-[380px]')}>
      <button
        onClick={toggle}
        className={cn(
          'px-5 w-full h-12 flex items-center justify-between gap-2 bg-[#E4E1DA] rounded-t-[4px] focus:outline-none',
          !isOpen && 'rounded-b-[4px]',
        )}
        data-testid="PrepareYourProposalDropdown"
      >
        <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">
          Prepare your proposal
        </HeaderTitle>
        {isOpen ? <X className="text-black cursor-pointer" /> : <ChevronDown className="text-black" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full w-full bg-[#E4E1DA] rounded-b-[4px] overflow-hidden z-10 shadow-lg"
          >
            <Typography className="px-5 max-w-[330px] text-[#666057] text-[15px] leading-snug">
              If these steps are not completed, your proposal is unlikely to reach quorum and succeed in a
              vote.
            </Typography>

            <div className="py-3 flex flex-col">
              {dropdownItemsData.map(({ Icon, text, title, id, linkUrl }) => (
                <div
                  key={id}
                  onClick={() => openLink(linkUrl)}
                  className="px-5 py-3 w-full flex items-center gap-3 hover:bg-[#D4CFC4] cursor-pointer"
                  /* Test IDs: PrepareYourProposalLink1, PrepareYourProposalLink2 */
                  data-testid={`PrepareYourProposalLink${id}`}
                >
                  <div className="flex items-center justify-center">
                    <Icon />
                  </div>
                  <div className="flex-grow flex flex-col gap-1">
                    <Typography className="text-[15px] leading-none text-[#171412]">{title}</Typography>
                    <Typography className="max-w-[230px] text-[12px] leading-none text-[#66605C]">
                      {text}
                    </Typography>
                  </div>
                  <div>
                    <ChevronRight strokeWidth={1.5} color="black" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
