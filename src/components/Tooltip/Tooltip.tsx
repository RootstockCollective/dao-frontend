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

  useEffect(() => {
    if (!open || isDesktop) return

    const handlePopState = () => setOpen(false)

    window.history.pushState({ tooltip: true }, '')
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      // If still on the tooltip state, go back
      if (window.history.state?.tooltip) {
        window.history.back()
      }
    }
  }, [open, isDesktop])

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
          side={isDesktop ? side : 'top'} // always top for mobile; it switches to bottom automatically if it's not enough space
          sideOffset={sideOffset}
          collisionPadding={16}
          className={cn(
            'rounded-sm bg-v3-text-80 text-v3-bg-accent-60 px-2 py-1 text-xs font-normal shadow-lg font-rootstock-sans',
            className,
          )}
          {...props}
        >
          <div className="max-w-[calc(100vw-64px)]">{text}</div>
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
