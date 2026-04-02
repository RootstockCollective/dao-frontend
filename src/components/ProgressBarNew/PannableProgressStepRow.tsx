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
}

/**
 * Pan offset for a horizontal step row: same math and resize behavior as the
 * original proposal progress bar (76px-per-step heuristic, window resize only).
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
                  className={cn('shrink-0 transition-colors', isCurrent ? 'text-text-100' : 'text-bg-0')}
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
