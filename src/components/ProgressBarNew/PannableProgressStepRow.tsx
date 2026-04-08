'use client'

import {
  type ComponentProps,
  Fragment,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { ProgressBar } from './ProgressBar'

export interface UsePannableStepRowOffsetParams {
  containerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  currentStepIndex: number
  /** When set, finds the active step via `data-stage` (1-based index). */
  stageDataAttributes?: boolean
  showStepSeparators?: boolean
}

function findStepElement(
  contentEl: HTMLElement,
  stepIndex: number,
  stageDataAttributes: boolean,
  showStepSeparators: boolean,
): HTMLElement | null {
  if (stageDataAttributes) {
    const el = contentEl.querySelector(`[data-stage="${stepIndex + 1}"]`)
    if (el instanceof HTMLElement) return el
  }
  const domIndex = showStepSeparators ? stepIndex * 2 : stepIndex
  const child = contentEl.children[domIndex]
  return child instanceof HTMLElement ? child : null
}

/**
 * Pan offset for a horizontal step row: scrolls so the active step stays in view
 * using measured label positions (variable widths like "SHARES CLAIMED").
 */
export function usePannableStepRowOffset({
  containerRef,
  contentRef,
  currentStepIndex,
  stageDataAttributes = false,
  showStepSeparators = true,
}: UsePannableStepRowOffsetParams): number {
  const [offset, setOffset] = useState(0)

  const calculateOffset = useCallback(() => {
    if (!containerRef.current || !contentRef.current) {
      return 0
    }

    const containerEl = containerRef.current
    const contentEl = contentRef.current
    const containerWidth = containerEl.offsetWidth
    const contentWidth = contentEl.scrollWidth

    if (contentWidth <= containerWidth) {
      return 0
    }

    const maxOffset = contentWidth - containerWidth
    const margin = 12

    const stepEl = findStepElement(contentEl, currentStepIndex, stageDataAttributes, showStepSeparators)

    let desiredOffset = 0

    if (stepEl) {
      const stepLeft = stepEl.offsetLeft
      const stepRight = stepLeft + stepEl.offsetWidth

      if (stepRight > containerWidth - margin) {
        desiredOffset = stepRight - containerWidth + margin
      }
      if (stepLeft < desiredOffset + margin) {
        desiredOffset = Math.max(0, stepLeft - margin)
      }
    } else {
      const stepWidth = 76
      const currentStepPosition = currentStepIndex * stepWidth
      const containerCenter = containerWidth / 2
      desiredOffset = Math.max(0, currentStepPosition - containerCenter + 40)
    }

    return Math.min(Math.max(0, desiredOffset), maxOffset)
  }, [containerRef, contentRef, currentStepIndex, stageDataAttributes, showStepSeparators])

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

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }

    const ro = new ResizeObserver(() => {
      setOffset(calculateOffset())
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [calculateOffset, containerRef])

  return offset
}

const proposalLabelClass = 'text-base leading-normal tracking-[1.28px] uppercase'

const separatorClassName = cn(proposalLabelClass, 'text-xl shrink-0 mx-2 text-bg-0')

export type PannableStepLabelVariant = 'proposal' | 'tag'

export type PannableProgressBarProps = Pick<
  ComponentProps<typeof ProgressBar>,
  'progress' | 'color' | 'className'
>

export interface PannableProgressStepRowProps {
  steps: readonly string[]
  /** 0-based index of the highlighted step (drives pan + label emphasis). */
  currentStepIndex: number
  /** Proposal detail: body uppercase labels. Vault: tag + caps. */
  stepLabelVariant: PannableStepLabelVariant
  /** Rendered below the step row inside the measurement container (same card width as labels). */
  progressBar: PannableProgressBarProps
  showStepSeparators?: boolean
  /** When true, each label gets `data-stage` (1-based). */
  stageDataAttributes?: boolean
  measureContainerClassName?: string
  className?: string
  rowClassName?: string
}

/**
 * Pannable step labels, `>` separators, and tiled progress bar in one measurement shell.
 * Shared by proposal detail and vault stepper.
 */
export function PannableProgressStepRow({
  steps,
  currentStepIndex,
  stepLabelVariant,
  showStepSeparators = true,
  stageDataAttributes = false,
  measureContainerClassName,
  className,
  rowClassName,
  progressBar,
}: PannableProgressStepRowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const offset = usePannableStepRowOffset({
    containerRef,
    contentRef,
    currentStepIndex,
    stageDataAttributes,
    showStepSeparators,
  })

  const { progress, color, className: progressBarClassName } = progressBar

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
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex
          const stageProps = stageDataAttributes ? { 'data-stage': index + 1 } : {}

          return (
            <Fragment key={`${step}-${index}`}>
              {stepLabelVariant === 'proposal' ? (
                <Span
                  variant="body-s"
                  className={cn(
                    proposalLabelClass,
                    'font-medium shrink-0',
                    isCurrent ? 'text-text-100' : 'text-bg-0',
                  )}
                  {...stageProps}
                >
                  {step}
                </Span>
              ) : (
                <Span
                  variant="tag"
                  caps
                  className={cn(
                    'shrink-0 transition-colors',
                    isCurrent ? 'text-text-100 font-semibold' : 'text-bg-0',
                  )}
                  {...stageProps}
                >
                  {step}
                </Span>
              )}
              {showStepSeparators && index < steps.length - 1 && (
                <Span variant="body-s" className={separatorClassName} aria-hidden={true}>
                  {'>'}
                </Span>
              )}
            </Fragment>
          )
        })}
      </div>
      <ProgressBar progress={progress} color={color} className={progressBarClassName} />
    </div>
  )
}
