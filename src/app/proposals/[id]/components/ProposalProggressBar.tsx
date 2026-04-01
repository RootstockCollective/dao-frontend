import { Fragment } from 'react'

import { PannableProgressStepRow, ProgressBar } from '@/components/ProgressBarNew'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ProposalState } from '@/shared/types'

interface ProgressBarProps {
  proposalState?: ProposalState
}

const proposalStateToProgressMap = new Map([
  [ProposalState.Active, 25],
  [ProposalState.Succeeded, 50],
  [ProposalState.Queued, 75],
  [ProposalState.Executed, 100],
  [ProposalState.Defeated, 100],
  [ProposalState.Canceled, 100],
  [undefined, 0],
])

const getStatusSteps = (proposalState: ProposalState) => {
  if (proposalState === ProposalState.Defeated || proposalState === ProposalState.Canceled) {
    return ['ACTIVE', 'FAILED']
  }
  return ['ACTIVE', 'SUCCEEDED', 'QUEUED', 'EXECUTED']
}

const getCurrentStepIndex = (proposalState: ProposalState) => {
  switch (proposalState) {
    case ProposalState.Active:
      return 0
    case ProposalState.Succeeded:
      return 1
    case ProposalState.Queued:
      return 2
    case ProposalState.Executed:
      return 3
    case ProposalState.Defeated:
    case ProposalState.Canceled:
      return 1 // FAILED is at index 1
    default:
      return 0
  }
}

const renderStatusPath = (proposalState: ProposalState) => {
  const steps = getStatusSteps(proposalState)
  const currentStepIndex = getCurrentStepIndex(proposalState)

  const classname = 'text-base leading-normal tracking-[1.28px] uppercase'

  return (
    <>
      {steps.map((step, index) => (
        <Fragment key={step}>
          <Span
            variant="body-s"
            className={cn(
              classname,
              'font-medium flex-shrink-0',
              index === currentStepIndex ? 'text-text-100' : 'text-bg-0',
            )}
          >
            {step}
          </Span>
          {index < steps.length - 1 && (
            <Span variant="body-s" className={cn(classname, 'text-xl flex-shrink-0 mx-2 text-bg-0')}>
              {'>'}
            </Span>
          )}
        </Fragment>
      ))}
    </>
  )
}

export const ProposalProggressBar = ({ proposalState }: ProgressBarProps) => {
  const getProgressBarColor = () => {
    if (proposalState === ProposalState.Defeated || proposalState === ProposalState.Canceled) {
      return ['#4B5CF0', '#F47A2A', '#ff6688']
    }
    return ['#4B5CF0', '#F47A2A', '#1BC47D']
  }

  return (
    <PannableProgressStepRow
      currentStepIndex={getCurrentStepIndex(proposalState!)}
      measureContainerClassName="flex flex-col w-full md:p-6 p-4 md:pb-10"
      footer={
        <ProgressBar
          progress={proposalStateToProgressMap.get(proposalState) ?? 0}
          className="mt-3"
          color={getProgressBarColor()}
        />
      }
    >
      {renderStatusPath(proposalState!)}
    </PannableProgressStepRow>
  )
}
