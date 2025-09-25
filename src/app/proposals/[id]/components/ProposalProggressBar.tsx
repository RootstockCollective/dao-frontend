import { Fragment } from 'react'
import { Span } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
import { ProposalState } from '@/shared/types'
import { cn } from '@/lib/utils'

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

  return (
    <>
      {steps.map((step, index) => (
        <Fragment key={step}>
          <Span
            variant="body-s"
            className={cn('flex-shrink-0', index === currentStepIndex ? 'text-white' : 'text-bg-0')}
          >
            {step}
          </Span>
          {index < steps.length - 1 && (
            <Span variant="body-s" className="flex-shrink-0 mx-3 text-bg-0">
              {'>'}
            </Span>
          )}
        </Fragment>
      ))}
    </>
  )
}

export const ProposalProggressBar = ({ proposalState }: ProgressBarProps) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between w-full">{renderStatusPath(proposalState!)}</div>
      <ProgressBar progress={proposalStateToProgressMap.get(proposalState) ?? 0} className="mt-3" />
    </div>
  )
}
