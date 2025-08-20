import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createContext, FC, ReactNode, useContext, useState } from 'react'

interface CallToActionCardContext {
  isOpen: boolean
  toggle: () => void
}

const CallToActionCardContext = createContext<CallToActionCardContext | null>(null)

interface CallToActionCardProviderProps {
  defaultOpen?: boolean
  children: ReactNode
}

const CallToActionCardProvider = ({ defaultOpen = true, children }: CallToActionCardProviderProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const toggle = () => setIsOpen(prev => !prev)

  return (
    <CallToActionCardContext.Provider value={{ isOpen, toggle }}>{children}</CallToActionCardContext.Provider>
  )
}

interface CallToActionCardProps extends CommonComponentProps {
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export const CallToActionCard = ({ defaultOpen = true, children, className = '' }: CallToActionCardProps) => {
  return (
    <CallToActionCardProvider defaultOpen={defaultOpen}>
      <div className={cn('flex flex-col flex-1 w-full', className)}>{children}</div>
    </CallToActionCardProvider>
  )
}

interface ChildProps {
  children: ReactNode
  className?: string
}

const Banner = ({ children }: { children: ReactNode }) => <div className="hidden md:block">{children}</div>

const Content = ({ children, className }: ChildProps) => <div className={className}>{children}</div>

const Collapsible = ({ children, className }: ChildProps) => {
  const ctx = useContext(CallToActionCardContext)
  if (!ctx) throw new Error('CallToActionCard.Collapsible must be used within CallToActionCard')

  return (
    <AnimatePresence>
      {ctx.isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
            height: { duration: 0.3 },
            opacity: { duration: 0.2 },
          }}
          style={{ overflow: 'hidden' }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const Toggle = () => {
  const ctx = useContext(CallToActionCardContext)
  if (!ctx) throw new Error('CallToActionCard.Toggle must be used within CallToActionCard')

  return (
    <div className="flex md:hidden w-full justify-end items-center h-6 py-2 cursor-pointer">
      <motion.div
        animate={{ rotate: ctx.isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onClick={ctx.toggle}
      >
        <ChevronDownIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" />
      </motion.div>
    </div>
  )
}

CallToActionCard.Banner = Banner
CallToActionCard.Content = Content
CallToActionCard.Collapsible = Collapsible
CallToActionCard.Toggle = Toggle
