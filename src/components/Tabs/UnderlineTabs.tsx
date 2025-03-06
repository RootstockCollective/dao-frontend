import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface Tab {
  value: string
  label: string
}

interface UnderlineTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (value: string) => void
}

export const UnderlineTabs = ({ tabs, activeTab, onTabChange }: UnderlineTabsProps) => (
  <Tabs.Root value={activeTab} onValueChange={onTabChange}>
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
