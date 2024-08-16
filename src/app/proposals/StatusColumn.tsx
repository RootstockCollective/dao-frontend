import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { Status } from '@/components/Status'
import { StatusSeverity } from '@/components/Status/types'

const StatusByProposalState = {
  Pending: 'in-progress',
  Active: 'in-progress',
  Canceled: 'canceled',
  Defeated: 'rejected',
  Succeeded: 'success',
  Queued: 'in-progress',
  Expired: 'rejected',
  Executed: 'success',
  undefined: null,
}

export const StatusColumn = ({ proposalId }: { proposalId: string }) => {
  const { proposalStateHuman } = useVoteOnProposal(proposalId)
  const statusMap = StatusByProposalState[
    proposalStateHuman as keyof typeof StatusByProposalState
  ] as StatusSeverity
  if (!proposalStateHuman) {
    return null
  }
  return <Status severity={statusMap} label={proposalStateHuman} />
}
