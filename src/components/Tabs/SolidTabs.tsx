import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { Label } from '../Typography'

type SolidTabsVariant = 'default' | 'muted'

interface SolidTabsProps extends Tabs.TabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (value: string) => void
  className?: string
  /** Affects list container and inactive tab styling. "muted" uses bg-bg-80 for a darker, subdued look. */
  variant?: SolidTabsVariant
}

const BASE_TABS_CLASSES =
  'relative px-4 py-1 rounded-[3px] transition-all duration-200 min-w-[108px] h-[36px] sm:min-w-[80px] sm:h-[28px] flex items-center justify-center flex-1 sm:flex-unset whitespace-nowrap'

const VARIANT_STYLES = {
  default: {
    listContainer: 'bg-bg-100',
    inactiveTrigger: 'text-text-60 hover:bg-bg-80',
  },
  muted: {
    listContainer: 'bg-bg-80',
    inactiveTrigger: 'bg-bg-80 text-text-60 hover:bg-bg-80',
  },
}

/**
 * Accessible tab navigation component with solid styling and smooth transitions between states.
 * Uses Radix UI for structure and Framer Motion for animations.
 */
export function SolidTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  variant = 'default',
  ...props
}: SolidTabsProps) {
  const styles = VARIANT_STYLES[variant]
  return (
    <div className={className}>
      <div className="flex flex-row items-center">
        <hr className="hidden sm:block w-full bg-bg-60 border-none h-px mr-2" />
        <Tabs.Root value={activeTab} onValueChange={onTabChange} {...props} className="flex-1 sm:flex-unset">
          <div className={cn('inline-flex rounded-md p-0.5 w-full sm:w-unset', styles.listContainer)}>
            <Tabs.List className="flex flex-row w-full sm:w-unset">
              {tabs.map(tab => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className={cn(BASE_TABS_CLASSES, activeTab === tab ? 'bg-bg-60' : styles.inactiveTrigger)}
                >
                  <Label variant="body-s" className="cursor-pointer">
                    {tab}
                  </Label>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>
        </Tabs.Root>
        <hr className="hidden sm:block w-full bg-bg-60 border-none h-px ml-2" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0.05, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.05, scale: 0.99 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
