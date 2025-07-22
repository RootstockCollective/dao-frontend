'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

const SWITCH_DEFAULT_CLASSES = `
relative 
h-[26px] 
w-[44px] 
rounded-full 
border-v3-bg-accent-100
bg-v3-bg-accent-100 
outline-hidden 
border 
data-[state=checked]:bg-v3-bg-accent-100
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
bg-v3-bg-accent-20
transition-transform 
duration-100 
data-[state=checked]:translate-x-[19px]
data-[state=checked]:bg-v3-text-100
`

const THUMB_DOT_CLASSES = `
  w-[8px] 
  h-[8px] 
  rounded-full 
  bg-black 
  absolute 
  left-1/2 
  top-1/2 
  -translate-x-1/2 
  -translate-y-1/2 
  opacity-0 
  group-data-[state=checked]:opacity-100 
  transition-opacity 
  duration-200
`

const SwitchThumb = forwardRef<
  ElementRef<typeof SwitchPrimitive.Thumb>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Thumb ref={ref} className={cn('group', THUMB_DEFAULT_CLASSES, className)} {...props}>
    <span className={cn(THUMB_DOT_CLASSES)} />
  </SwitchPrimitive.Thumb>
))
SwitchThumb.displayName = SwitchPrimitive.Thumb.displayName

export { Switch, SwitchThumb }
