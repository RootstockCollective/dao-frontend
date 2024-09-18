'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

const Tabs = TabsPrimitive.Root

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('flex flex-row gap-x-1', className)} {...props} />
))
TabsList.displayName = TabsPrimitive.TabsList.displayName

const active =
  'data-[state=active]:px-[16px] data-[state=active]:py-[8px] data-[state=active]:rounded-md data-[state=active]:bg-primary'
const inactive =
  'data-[state=inactive]:px-[16px] data-[state=inactive]:py-[8px] data-[state=inactive]:font-light'

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={cn(active, inactive, className)} {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = TabsPrimitive.Content

export { Tabs, TabsList, TabsTrigger, TabsContent }
