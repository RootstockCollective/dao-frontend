'use client'

import React, { Fragment } from 'react'

import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { PannableProgressStepRow } from './PannableProgressStepRow'
import { ProgressBar } from './ProgressBar'

const separatorClassName =
  'text-base leading-normal tracking-[1.28px] uppercase text-xl flex-shrink-0 mx-2 text-bg-0'

export interface ProgressStepperProps {
  stages: readonly string[]
  currentStage: number
  isFailed?: boolean
  /** When true, renders the same > separators as the proposal progress row. Default true. */
  showSeparators?: boolean
}

export function ProgressStepper({
  stages,
  currentStage,
  isFailed = false,
  showSeparators = true,
}: ProgressStepperProps) {
  const effectiveStage = isFailed ? 1 : currentStage
  const progressPercent = isFailed ? 0 : (effectiveStage / stages.length) * 100
  const currentStepIndex = isFailed ? 0 : effectiveStage - 1

  return (
    <div data-testid="progress-stepper" className="flex flex-col gap-2">
      <PannableProgressStepRow currentStepIndex={currentStepIndex}>
        {stages.map((label, i) => {
          const stageNum = i + 1
          const isCurrent = i === currentStepIndex
          return (
            <Fragment key={`${label}-${i}`}>
              <Span
                variant="tag"
                caps
                data-stage={stageNum}
                className={cn('shrink-0 transition-colors', isCurrent ? 'text-text-100' : 'text-bg-0')}
              >
                {label}
              </Span>
              {showSeparators && i < stages.length - 1 && (
                <Span variant="body-s" className={separatorClassName} aria-hidden={true}>
                  {'>'}
                </Span>
              )}
            </Fragment>
          )
        })}
      </PannableProgressStepRow>
      <ProgressBar progress={progressPercent} className="w-full" />
      {isFailed && (
        <Span variant="tag" caps data-testid="failed-indicator" className="font-semibold text-destructive">
          Failed
        </Span>
      )}
    </div>
  )
}
