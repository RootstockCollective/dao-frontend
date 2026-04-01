'use client'

import { type ReactNode, type RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface UsePannableStepRowOffsetParams {
  containerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  currentStepIndex: number
}

/**
 * Pan offset for a horizontal step row: same math and resize behavior as
 * {@link ProposalProggressBar} (76px-per-step heuristic, window resize only).
 */
export function usePannableStepRowOffset({
  containerRef,
  contentRef,
  currentStepIndex,
}: UsePannableStepRowOffsetParams): number {
  const [offset, setOffset] = useState(0)

  const calculateOffset = useCallback(() => {
    if (!containerRef.current || !contentRef.current) {
      return 0
    }

    const containerWidth = containerRef.current.offsetWidth
    const contentWidth = contentRef.current.scrollWidth

    if (contentWidth <= containerWidth) {
      return 0
    }

    const stepWidth = 76
    const currentStepPosition = currentStepIndex * stepWidth
    const containerCenter = containerWidth / 2
    const desiredOffset = Math.max(0, currentStepPosition - containerCenter + 40)
    const maxOffset = contentWidth - containerWidth

    return Math.min(desiredOffset, maxOffset)
  }, [containerRef, contentRef, currentStepIndex])

  useLayoutEffect(() => {
    setOffset(calculateOffset())
  }, [calculateOffset])

  useLayoutEffect(() => {
    const handleResize = () => {
      setOffset(calculateOffset())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateOffset])

  return offset
}

export interface PannableProgressStepRowProps {
  children: ReactNode
  currentStepIndex: number
  measureContainerClassName?: string
  className?: string
  rowClassName?: string
  /** Rendered after the pannable row inside the measurement container (e.g. proposal ProgressBar). */
  footer?: ReactNode
}

/**
 * ProposalView-style step row: measurement container ref, inner flex row with justify-between,
 * translateX when content overflows. Uses {@link usePannableStepRowOffset}.
 */
export function PannableProgressStepRow({
  currentStepIndex,
  measureContainerClassName,
  className,
  rowClassName,
  children,
  footer,
}: PannableProgressStepRowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const offset = usePannableStepRowOffset({
    containerRef,
    contentRef,
    currentStepIndex,
  })

  return (
    <div
      ref={containerRef}
      className={cn('min-w-0 w-full overflow-hidden', measureContainerClassName, className)}
    >
      <div
        ref={contentRef}
        className={cn('flex w-full flex-row justify-between', rowClassName)}
        style={{ transform: offset > 0 ? `translateX(-${offset}px)` : undefined }}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}
