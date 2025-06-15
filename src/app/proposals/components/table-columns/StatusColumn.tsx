import { Status } from '@/components/Status'
import { ProposalState } from '@/shared/types'

interface StatusColumnProps {
  proposalState?: ProposalState
}

export const StatusColumn = ({ proposalState }: StatusColumnProps) => {
  if (typeof proposalState === 'undefined') {
    return null
  }
  return <Status proposalState={proposalState} />
}
