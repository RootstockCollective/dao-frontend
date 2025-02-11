import { HTMLAttributes, useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderTitle, Typography } from '@/components/Typography'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { DropdownItem, DropdownTopic } from './data'

/**
 * Custom dropdown menu with smooth animation
 */

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  data: DropdownTopic[]
  subtitle?: string
  footer?: ReactNode
}

export const DropdownItemComponent = ({ id, onClick, title, text, Icon, TitleIcon }: DropdownItem) => {
  return (
    <div
      key={id}
      onClick={onClick}
      className="px-5 py-3 w-full flex items-center gap-3 hover:bg-[#D4CFC4] cursor-pointer"
      /* Test IDs: PrepareYourProposalLink1, PrepareYourProposalLink2 */
      data-testid={`DropdownLink${id}`}
    >
      <div className="flex items-center justify-center">
        <Icon />
      </div>
      <div className="flex flex-grow flex-col gap-1">
        <div className="flex flex-row">
          <Typography className="text-[14px] leading-none text-[#171412] font-normal" fontFamily="kk-topo">
            {title}
          </Typography>
          {TitleIcon ? <TitleIcon size={16} className="ml-1" /> : null}
        </div>
        {text ? (
          <Typography className="max-w-[230px] text-[12px] leading-none text-[#66605C]">{text}</Typography>
        ) : null}
      </div>
      <div>
        <ChevronRight strokeWidth={1.5} color="black" />
      </div>
    </div>
  )
}

export const Dropdown = ({ className, ...props }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  // Closes the dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null)
  useClickOutside([dropdownRef], close)

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
        <div className={`${isOpen ? 'flex flex-row' : ''}`}>
          <HeaderTitle className="text-lg leading-none text-black whitespace-nowrap">
            {props.title}
          </HeaderTitle>
          {props.subtitle ? (
            <Typography className={cn('text-[10px] text-left text-black', isOpen && 'ml-1')}>
              {props.subtitle}
            </Typography>
          ) : null}
        </div>
        {isOpen ? <X className="text-black cursor-pointer" /> : <ChevronDown className="text-black" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full w-full bg-[#E4E1DA] rounded-b-[4px] overflow-y-auto max-h-[450px] scroll-smooth z-10 shadow-lg pb-[18px]"
          >
            <Typography className="px-5 max-w-[330px] text-[#666057] text-[15px] leading-snug">
              {props.description}
            </Typography>
            {props.data.map(({ topic, items }) => (
              <div key={topic ?? 'Uncategorized'} className="py-3 flex flex-col">
                {topic ? (
                  <Typography className="ml-5 text-[12px] leading-none text-[#171412] font-bold font-rootstock-sans">
                    {topic}
                  </Typography>
                ) : null}
                {items.map(({ Icon, text, title, id, onClick, TitleIcon }) => (
                  <DropdownItemComponent
                    key={id}
                    id={id}
                    onClick={onClick}
                    title={title}
                    text={text}
                    Icon={Icon}
                    TitleIcon={TitleIcon}
                  />
                ))}
              </div>
            ))}

            {props.footer ? props.footer : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
