import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createContext, ReactNode, useContext, useState } from 'react'

// TODO: this component can be replaced by Radix Collapsible
// https://www.radix-ui.com/primitives/docs/components/collapsible

interface CollapsibleContext {
  isOpen: boolean
  toggle: () => void
}

const CollapsibleContext = createContext<CollapsibleContext | null>(null)

interface CollapsibleProviderProps {
  children: ReactNode
  defaultOpen?: boolean
}

const CollapsibleProvider = ({ defaultOpen = true, children }: CollapsibleProviderProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const toggle = () => setIsOpen(prev => !prev)

  return <CollapsibleContext.Provider value={{ isOpen, toggle }}>{children}</CollapsibleContext.Provider>
}

export interface CollapsibleProps extends CommonComponentProps {
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

const Root = ({ defaultOpen = true, children, className = '' }: CollapsibleProps) => {
  return (
    <CollapsibleProvider defaultOpen={defaultOpen}>
      <div className={cn('flex flex-col flex-1 w-full', className)}>{children}</div>
    </CollapsibleProvider>
  )
}

interface ChildProps {
  children: ReactNode
  className?: string
}

const Content = ({ children, className }: ChildProps) => {
  const ctx = useContext(CollapsibleContext)
  if (!ctx) throw new Error('Collapsible.Content must be used within Collapsible')

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

interface ToggleProps {
  className?: string
  iconClassName?: string
}

const Toggle = ({ className, iconClassName }: ToggleProps) => {
  const ctx = useContext(CollapsibleContext)
  if (!ctx) throw new Error('Collapsible.Toggle must be used within Collapsible')

  return (
    <div className={cn('flex md:hidden w-full items-center h-6 py-2 cursor-pointer', className)}>
      <motion.div
        animate={{ rotate: ctx.isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onClick={ctx.toggle}
      >
        <ChevronDownIcon className={cn('w-6 h-6 text-gray-600 hover:text-gray-800', iconClassName)} />
      </motion.div>
    </div>
  )
}

export const Collapsible = {
  Root,
  Content,
  Toggle,
}
