import React, { ReactNode, useState } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export interface TooltipProps extends RadixTooltip.TooltipContentProps {
  text: ReactNode
  disabled?: boolean
  delayDuration?: number
  supportMobileTap?: boolean
}

function useHasHover() {
  try {
    return matchMedia('(hover: hover)').matches
  } catch {
    // Assume that if browser too old to support matchMedia it's likely not a touch device
    return true
  }
}

type TooltipTriggerContextType = {
  supportMobileTap: boolean
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const TooltipTriggerContext = React.createContext<TooltipTriggerContextType>({
  supportMobileTap: false,
  open: false,
  setOpen: () => {},
})

const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof RadixTooltip.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Trigger>
>(({ children, ...props }, ref) => {
  const hasHover = useHasHover()
  const { setOpen, supportMobileTap } = React.useContext(TooltipTriggerContext)

  const { onClick: onClickProp } = props

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hasHover && supportMobileTap) {
        e.preventDefault()
        setOpen(true)
      } else {
        onClickProp?.(e)
      }
    },
    [setOpen, hasHover, supportMobileTap, onClickProp],
  )

  return (
    <RadixTooltip.Trigger ref={ref} {...props} onClick={onClick}>
      {children}
    </RadixTooltip.Trigger>
  )
})
TooltipTrigger.displayName = RadixTooltip.Trigger.displayName

export function Tooltip({
  className,
  children,
  text,
  side = 'right',
  sideOffset = 5,
  disabled = false,
  delayDuration = 100,
  supportMobileTap = true,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState<boolean>(false)
  const hasHover = useHasHover()
  const isMobile = !hasHover && supportMobileTap

  if (disabled) {
    return children
  }

  return (
    <RadixTooltip.Root delayDuration={isMobile ? 0 : delayDuration} onOpenChange={setOpen} open={open}>
      <TooltipTriggerContext.Provider value={{ supportMobileTap, open, setOpen }}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={isMobile ? 'bottom' : side}
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
      </TooltipTriggerContext.Provider>
    </RadixTooltip.Root>
  )
}
