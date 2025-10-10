'use client'

import { Fragment } from 'react'
import { ProgressBar } from '@/components/ProgressBarNew'
import { useProposalStepper, ProposalStep } from './StepperProvider'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ChevronIcon } from './ChevronIcon'

const progressMap = {
  [ProposalStep.None]: 0,
  [ProposalStep.Type]: 25,
  [ProposalStep.Details]: 71,
  [ProposalStep.Review]: 100,
} satisfies Record<ProposalStep, number>

export function ProposalStepper() {
  const { currentStep } = useProposalStepper()
  return (
    <div className="mb-12 w-full">
      <div className="mb-3 flex justify-between items-center">
        {Object.keys(ProposalStep)
          .filter(step => step !== ProposalStep.None)
          .map((item, i) => (
            <Fragment key={i}>
              {i > 0 && <ChevronIcon />}
              <Paragraph
                className={cn(
                  'font-medium tracking-wider uppercase',
                  currentStep === item ? 'text-text-100' : 'text-bg-0',
                )}
              >
                {item}
              </Paragraph>
            </Fragment>
          ))}
      </div>
      <ProgressBar progress={progressMap[currentStep]} color={['#4B5CF0', '#F47A2A', '#1BC47D']} />
    </div>
  )
}
