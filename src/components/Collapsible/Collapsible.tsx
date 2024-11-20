'use client'

import { cn } from '@/lib/utils'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import React from 'react'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const iconBaseCn = 'h-6 w-6 shrink-0'
  return (
    <div className="flex">
      <div className="flex gap-[10px] w-full">
        <CollapsiblePrimitive.Trigger ref={ref} className={cn('transition-all group', className)} {...props}>
          <SlArrowUp className={cn(iconBaseCn, 'group-data-[state=open]:hidden')} />
          <SlArrowDown className={cn(iconBaseCn, 'group-data-[state=closed]:hidden')} />
        </CollapsiblePrimitive.Trigger>
        {children}
      </div>
    </div>
  )
})
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
      className,
    )}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
