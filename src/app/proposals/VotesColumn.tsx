import { useProposalContext } from '@/app/proposals/ProposalsContext'
import { toFixed } from '@/lib/utils'

export const VotesColumn = () => {
  const { proposalVotes } = useProposalContext()

  const votes = proposalVotes.reduce((prev, next) => Number(next) + prev, 0)
  return <p>{toFixed(votes)}</p>
}
