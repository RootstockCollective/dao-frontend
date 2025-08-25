import { Fragment } from 'react'
import { Span } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
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

const renderStatusPath = (proposalState: ProposalState) => {
  const steps = getStatusSteps(proposalState)

  return (
    <>
      {steps.map((step, index) => (
        <Fragment key={step}>
          <Span variant="body-s">{step}</Span>
          {index < steps.length - 1 && <Span variant="body-s">{'>'}</Span>}
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
