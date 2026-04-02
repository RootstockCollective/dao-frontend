import * as RadixTooltip from '@radix-ui/react-tooltip'
import React, { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { usePortalContainer } from '../PortalContainerContext'
import { Span } from '../Typography'

const VIEWPORT_EDGE_PAD = 16

function visualViewportXBounds() {
  if (typeof window === 'undefined') return { left: 0, right: 0 }
  const vv = window.visualViewport
  if (vv) {
    const left = vv.offsetLeft
    const right = vv.offsetLeft + vv.width
    return { left, right }
  }
  return { left: 0, right: window.innerWidth }
}

/**
 * Radix Popper uses Floating UI `shift` with `crossAxis: false`, so top/bottom tooltips
 * are not nudged horizontally. Also, `max-width` on an inline <span> does not wrap long
 * phrases reliably. We constrain width on the content root (block box) and nudge the
 * panel into the *visual* viewport (not just `innerWidth` on mobile).
 */
function useClampTooltipToViewportX(open: boolean) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [nudgeX, setNudgeX] = useState(0)

  const recalc = useCallback(() => {
    if (!open) return
    const el = contentRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const { left, right } = visualViewportXBounds()
    let shift = 0
    if (rect.right > right - VIEWPORT_EDGE_PAD) shift += right - VIEWPORT_EDGE_PAD - rect.right
    if (rect.left + shift < left + VIEWPORT_EDGE_PAD) shift += left + VIEWPORT_EDGE_PAD - (rect.left + shift)
    setNudgeX(prev => (Math.abs(prev - shift) < 0.5 ? prev : shift))
  }, [open])

  useLayoutEffect(() => {
    if (!open) {
      setNudgeX(0)
      return
    }
    let burstRaf = 0
    let burstCount = 0
    let burstCancelled = false
    const burst = () => {
      if (burstCancelled) return
      recalc()
      burstCount += 1
      if (burstCount < 24) burstRaf = requestAnimationFrame(burst)
    }
    burstRaf = requestAnimationFrame(burst)

    const ro = new ResizeObserver(recalc)
    const attachRo = () => {
      const node = contentRef.current
      if (node) ro.observe(node)
    }
    attachRo()
    requestAnimationFrame(attachRo)

    const vv = window.visualViewport
    vv?.addEventListener('resize', recalc)
    vv?.addEventListener('scroll', recalc)
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, true)
    return () => {
      burstCancelled = true
      cancelAnimationFrame(burstRaf)
      ro.disconnect()
      vv?.removeEventListener('resize', recalc)
      vv?.removeEventListener('scroll', recalc)
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc, true)
    }
  }, [open, recalc])

  return { contentRef, nudgeX }
}

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

interface TooltipTriggerContextType {
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
  style: styleProp,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState<boolean>(false)
  const hasHover = useHasHover()
  const isMobile = !hasHover && supportMobileTap
  const pointerDown = usePointerDown()
  const portalContainer = usePortalContainer()
  const { contentRef, nudgeX } = useClampTooltipToViewportX(open)

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
            ref={contentRef}
            side={isMobile ? 'top' : side}
            sideOffset={sideOffset}
            collisionPadding={VIEWPORT_EDGE_PAD}
            {...({ updatePositionStrategy } as { updatePositionStrategy?: 'optimized' | 'always' })}
            className={cn(
              'z-tooltip box-border min-w-0 max-w-[min(20rem,calc(100dvw-1.5rem))] rounded-sm bg-v3-text-80 px-2 py-1 shadow-lg',
              className,
            )}
            style={{
              ...styleProp,
              ...(nudgeX !== 0 && {
                transform: [styleProp?.transform, `translateX(${nudgeX}px)`].filter(Boolean).join(' '),
              }),
            }}
            {...props}
          >
            <Span variant="body-s" className="block w-full max-w-full wrap-break-word text-v3-bg-accent-60">
              {text}
            </Span>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </TooltipTriggerContext.Provider>
    </RadixTooltip.Root>
  )
}
