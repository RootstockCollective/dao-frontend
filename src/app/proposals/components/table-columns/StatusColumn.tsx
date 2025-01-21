import { Status } from '@/components/Status'
import { type StatusSeverity } from '@/components/Status/types'

const StatusByProposalState = {
  Pending: 'in-progress',
  Active: 'in-progress',
  Canceled: 'canceled',
  Defeated: 'rejected',
  Succeeded: 'success',
  Queued: 'queue',
  Expired: 'rejected',
  Executed: 'success',
  undefined: null,
}

interface StatusColumnProps {
  proposalState?: string
}

export const StatusColumn = ({ proposalState }: StatusColumnProps) => {
  const statusMap = StatusByProposalState[
    proposalState as keyof typeof StatusByProposalState
  ] as StatusSeverity
  if (typeof proposalState === 'undefined') {
    return null
  }
  return <Status severity={statusMap} label={proposalState} />
}
