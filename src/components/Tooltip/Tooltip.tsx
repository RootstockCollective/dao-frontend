import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
import { motion } from 'motion/react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

interface TooltipProps extends PropsWithChildren {
  text: string
  position?: 'right' | 'left' | 'top' | 'bottom'
  disabled?: boolean
}

export function Tooltip({ children, text, position = 'right', disabled = false }: TooltipProps) {
  if (disabled) {
    return <>{children}</>
  }
  return (
    <RadixTooltip.Root delayDuration={300}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={position}
          sideOffset={5}
          className={cn('rounded-full bg-[#35312E] px-2 py-1 text-warm-gray text-xs font-normal shadow-lg')}
        >
          {text}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
