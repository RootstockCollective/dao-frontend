import React, { ReactNode, useEffect, useState } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { Span } from '../Typography'
import { usePortalContainer } from '../PortalContainerContext'

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
    return true
  }
}

// Track if a pointer is currently down (mouse/touch/pen)
function usePointerDown() {
  const [down, setDown] = useState(false)
  useEffect(() => {
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])
  return down
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
  // allow callers to override; if omitted we switch to rAF while dragging
  updatePositionStrategy: updatePositionStrategyProp,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState<boolean>(false)
  const hasHover = useHasHover()
  const isMobile = !hasHover && supportMobileTap
  const pointerDown = usePointerDown()
  const portalContainer = usePortalContainer()

  // Prefer rAF updates while pointer is down to avoid ResizeObserver loop warnings.
  const updatePositionStrategy =
    (updatePositionStrategyProp as 'optimized' | 'always' | undefined) ??
    (pointerDown ? 'always' : 'optimized')

  useEffect(() => {
    if (!open || !isMobile) return
    const handlePopState = () => setOpen(false)
    window.history.pushState({ tooltip: true }, '')
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (window.history.state?.tooltip) {
        window.history.back()
      }
    }
  }, [open, isMobile])

  if (disabled) {
    return children
  }

  return (
    <RadixTooltip.Root delayDuration={isMobile ? 0 : delayDuration} onOpenChange={setOpen} open={open}>
      <TooltipTriggerContext.Provider value={{ supportMobileTap, open, setOpen }}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <RadixTooltip.Portal container={portalContainer}>
          <RadixTooltip.Content
            side={isMobile ? 'top' : side}
            sideOffset={sideOffset}
            collisionPadding={16}
            {...({ updatePositionStrategy } as { updatePositionStrategy?: 'optimized' | 'always' })}
            className={cn('z-tooltip rounded-sm bg-v3-text-80 px-2 py-1 shadow-lg', className)}
            {...props}
          >
            <Span variant="body-s" className="max-w-[calc(100vw-64px)] text-v3-bg-accent-60">
              {text}
            </Span>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </TooltipTriggerContext.Provider>
    </RadixTooltip.Root>
  )
}
