import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface BaseTab<T = string> {
  value: T
  label?: ReactNode
}

interface UnderlineTabsProps<T extends BaseTab<U>, U = string> extends Tabs.TabsProps {
  tabs: T[]
  activeTab: U
  onTabChange: (value: U) => void
  layoutId?: string
}

export function UnderlineTabs<T extends BaseTab<U>, U extends string>({
  tabs,
  activeTab,
  onTabChange,
  layoutId = 'underline',
  ...props
}: UnderlineTabsProps<T, U>) {
  return (
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
  )
}
