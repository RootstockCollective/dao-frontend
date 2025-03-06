import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface BaseTab<U extends string> {
  value: U
  label: string
}

interface UnderlineTabsProps<U extends string, T extends BaseTab<U>> {
  tabs: T[]
  activeTab: U
  onTabChange: (value: U) => void
}

export function UnderlineTabs<U extends string, T extends BaseTab<U>>({
  tabs,
  activeTab,
  onTabChange,
}: UnderlineTabsProps<U, T>) {
  return (
    <Tabs.Root value={activeTab} onValueChange={val => onTabChange(val as U)}>
      <Tabs.List className="flex flex-row">
        {tabs.map(tab => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative min-w-[94px] h-[46px] px-[12px]',
              'text-sm font-rootstock-sans tracking-normal leading-tight',
              activeTab === tab.value ? 'text-primary font-bold' : 'text-white font-normal',
            )}
          >
            {tab.label}

            {/* Animated Underline */}
            {activeTab === tab.value && (
              <motion.div
                layoutId="underline"
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
  )
}
