'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils/utils'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

const SWITCH_DEFAULT_CLASSES = `
relative 
h-[26px] 
w-[44px] 
rounded-full 
border-[#2D2D2D] 
bg-[#1A1A1A] 
outline-hidden 
border 
data-[state=checked]:bg-[#E56B1A]
`

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} className={cn(SWITCH_DEFAULT_CLASSES, className)} {...props} />
))
Switch.displayName = SwitchPrimitive.Root.displayName

const THUMB_DEFAULT_CLASSES = `
block 
size-[20px] 
translate-x-0.5 
rounded-full 
bg-white 
transition-transform 
duration-100 
data-[state=checked]:translate-x-[19px]
`

const SwitchThumb = forwardRef<
  ElementRef<typeof SwitchPrimitive.Thumb>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Thumb ref={ref} className={cn(THUMB_DEFAULT_CLASSES, className)} {...props} />
))
SwitchThumb.displayName = SwitchPrimitive.Thumb.displayName

export { Switch, SwitchThumb }
