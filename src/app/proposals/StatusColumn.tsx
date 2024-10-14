import { Status } from '@/components/Status'
import { StatusSeverity } from '@/components/Status/types'
import { useProposalContext } from '@/app/proposals/ProposalsContext'

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

export const StatusColumn = () => {
  const { proposalStateHuman } = useProposalContext()
  const statusMap = StatusByProposalState[
    proposalStateHuman as keyof typeof StatusByProposalState
  ] as StatusSeverity
  if (!proposalStateHuman) {
    return null
  }
  return <Status severity={statusMap} label={proposalStateHuman} />
}
