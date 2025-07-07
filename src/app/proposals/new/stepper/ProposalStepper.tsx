'use client'

import { Fragment } from 'react'
import { ProgressBar } from '@/components/ProgressBarNew'
import { useProposalStepper, ProposalStep } from './StepperProvider'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { ChevronIcon } from '../images/ChevronIcon'

const progressMap = {
  [ProposalStep.Type]: 25,
  [ProposalStep.Details]: 72,
  [ProposalStep.Review]: 100,
}

export function ProposalStepper() {
  const { currentStep } = useProposalStepper()
  return (
    <div className="mb-12 w-full">
      <div className="mb-3 flex justify-between items-center">
        {Object.keys(ProposalStep).map((item, i) => (
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
      <ProgressBar progress={progressMap[currentStep]} color={['transparent', ['#4B5CF0', '#F47A2A']]} />
    </div>
  )
}
