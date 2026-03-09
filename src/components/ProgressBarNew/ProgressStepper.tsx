'use client'

import React from 'react'

import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { ProgressBar } from './ProgressBar'

export interface ProgressStepperProps {
  stages: readonly string[]
  currentStage: number
  isFailed?: boolean
  showSeparators?: boolean
}

export function ProgressStepper({
  stages,
  currentStage,
  isFailed = false,
  showSeparators = false,
}: ProgressStepperProps) {
  const effectiveStage = isFailed ? 1 : currentStage
  const progressPercent = isFailed ? 0 : (effectiveStage / stages.length) * 100

  return (
    <div data-testid="progress-stepper" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        {stages.map((label, i) => {
          const stageNum = i + 1
          const isActive = !isFailed && stageNum <= effectiveStage
          const isCurrent = !isFailed && stageNum === effectiveStage
          return (
            <React.Fragment key={label}>
              <Span
                variant="tag"
                caps
                data-stage={stageNum}
                className={cn(
                  'transition-colors',
                  isCurrent && 'font-semibold text-primary',
                  isActive && !isCurrent && 'text-100',
                  !isActive && 'text-200',
                )}
              >
                {label}
              </Span>
              {showSeparators && i < stages.length - 1 && (
                <svg
                  width="5"
                  height="10"
                  viewBox="0 0 5 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M1 1L4 5L1 9" stroke="var(--Background-0, #ACA39D)" strokeWidth="1.25" />
                </svg>
              )}
            </React.Fragment>
          )
        })}
      </div>
      <ProgressBar progress={progressPercent} className="w-full" />
      {isFailed && (
        <Span variant="tag" caps data-testid="failed-indicator" className="font-semibold text-destructive">
          Failed
        </Span>
      )}
    </div>
  )
}
