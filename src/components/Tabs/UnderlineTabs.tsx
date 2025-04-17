import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

/**
 * Represents a basic tab structure.
 */
export interface BaseTab<T = string> {
  /**
   * The unique identifier of the tab.
   */
  value: T
  /**
   * Optional label displayed for the tab.
   */
  label?: ReactNode
}

/**
 * Props for the UnderlineTabs component.
 */
interface UnderlineTabsProps<T extends BaseTab<U>, U = string> extends Tabs.TabsProps {
  /**
   * Array of tab objects containing a value and an optional label.
   */
  tabs: T[]
  /**
   * The currently active tab value.
   */
  activeTab: U
  /**
   * Callback function triggered when a tab is selected.
   */
  onTabChange: (value: U) => void
  /**
   * Unique ID for Framer Motion's layout animation.
   * Needs to be provided when there are multiple Tabs on the same page
   */
  layoutId?: string
}

/**
 * UnderlineTabs is a tab navigation component with an animated underline.
 * It utilizes Radix UI for tab structure and Framer Motion for smooth transitions.
 * The underline moves dynamically with the active tab, and the tab content fades in and out.
 */
export function UnderlineTabs<T extends BaseTab<U>, U extends string>({
  tabs,
  activeTab,
  onTabChange,
  layoutId = 'underline',
  children,
  ...props
}: UnderlineTabsProps<T, U>) {
  return (
    <div>
      <Tabs.Root value={activeTab} onValueChange={val => onTabChange(val as U)} {...props}>
        <Tabs.List className="flex flex-row">
          {tabs.map(({ value, label }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={cn(
                'relative min-w-[94px] h-[46px] px-[12px]',
                'text-sm font-rootstock-sans tracking-normal leading-tight',
                activeTab === value ? 'text-primary font-bold' : 'text-white font-normal',
              )}
            >
              {label ?? value}
              {activeTab === value && (
                <motion.div
                  layoutId={layoutId}
                  transition={{
                    type: 'spring',
                    stiffness: 700,
                    damping: 40,
                    mass: 2,
                  }}
                  className="absolute -bottom-px left-0 right-0 h-[1px] bg-primary"
                />
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
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
