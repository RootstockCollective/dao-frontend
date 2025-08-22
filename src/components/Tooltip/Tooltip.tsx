import { ReactNode, useEffect, useState } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export interface TooltipProps extends RadixTooltip.TooltipContentProps {
  text: ReactNode
  disabled?: boolean
  delayDuration?: number
}

export function Tooltip({
  className,
  children,
  text,
  side = 'right',
  sideOffset = 5,
  disabled = false,
  delayDuration = 100,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false)

  const isDesktop = useIsDesktop()
  if (disabled) {
    return children
  }

  return (
    <RadixTooltip.Root delayDuration={delayDuration} open={open} onOpenChange={setOpen}>
      <RadixTooltip.Trigger onMouseEnter={() => setOpen(true)} asChild>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={isDesktop ? side : 'bottom'}
          sideOffset={sideOffset}
          className={cn(
            'rounded-sm bg-v3-text-80 text-v3-bg-accent-60 px-2 py-1 text-xs font-normal shadow-lg font-rootstock-sans',
            /* Mixing in new classes (not replacing all the default classes) */
            className,
          )}
          {...props}
        >
          {text}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
