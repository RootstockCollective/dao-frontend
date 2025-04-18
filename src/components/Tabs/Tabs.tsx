'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, ElementRef, forwardRef, ReactNode } from 'react'
import { Typography } from '@/components/Typography'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const Tabs = TabsPrimitive.Root

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('flex flex-row gap-x-1 mb-6', className)} {...props} />
))
TabsList.displayName = TabsPrimitive.TabsList.displayName

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, onClick, value, ...props }, ref) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateSearchParam = (tab: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('tab', tab)
    const updatedUrl = `${pathname}?${params.toString()}`
    router.push(updatedUrl)
  }
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'h-12 whitespace-nowrap',
        'data-[state=active]:border-b data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold',
        'data-[state=inactive]:text-white data-[state=inactive]:font-normal',
        'px-[16px] py-[8px]',
        className,
      )}
      value={value}
      onClick={(...e) => (onClick ? onClick(...e) : updateSearchParam(value))}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = TabsPrimitive.Content

type TabTitleProps = {
  children: ReactNode
}

// TODO: To be aligned with the design once we have access to dev mode
const TabTitle = ({ children }: TabTitleProps) => (
  <Typography tagVariant="label" fontFamily="rootstock-sans">
    {children}
  </Typography>
)

export { Tabs, TabsList, TabsTrigger, TabsContent, TabTitle }
