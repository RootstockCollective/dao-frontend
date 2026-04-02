'use client'

import { Span } from '@/components/Typography'

import { PannableProgressStepRow } from './PannableProgressStepRow'

export interface ProgressStepperProps {
  stages: readonly string[]
  currentStage: number
  isFailed?: boolean
  /** When true, renders > separators between labels. Default true. */
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
      <PannableProgressStepRow
        steps={stages}
        currentStepIndex={currentStepIndex}
        stepLabelVariant="tag"
        showStepSeparators={showSeparators}
        stageDataAttributes
        progressBar={{
          progress: progressPercent,
          className: 'mt-2',
        }}
      />
      {isFailed && (
        <Span variant="tag" caps data-testid="failed-indicator" className="font-semibold text-destructive">
          Failed
        </Span>
      )}
    </div>
  )
}
