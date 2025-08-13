import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { FC, ReactNode, useState } from 'react'

interface CallToActionCardProps extends CommonComponentProps {
  banner?: ReactNode
  title: ReactNode
  collapsibleContent?: ReactNode
  defaultOpen?: boolean
  onStateChange?: (isOpen: boolean) => void
}

export const CallToActionCard: FC<CallToActionCardProps> = ({
  banner,
  title,
  children,
  collapsibleContent,
  className = '',
  defaultOpen = true,
  onStateChange,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onStateChange?.(newState)
  }

  const showChevron = collapsibleContent !== undefined

  return (
    <div data-testid="CallToActionCard" className={cn('flex flex-col flex-1 rounded-sm relative', className)}>
      {banner && <div className="hidden md:block">{banner}</div>}

      {showChevron && (
        <div className="absolute top-4 right-4 cursor-pointer z-10">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronDownIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" onClick={handleToggle} />
          </motion.div>
        </div>
      )}
      {title}

      <AnimatePresence>
        {collapsibleContent && isOpen && (
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
          >
            {collapsibleContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always visible content */}
      {children}
    </div>
  )
}
