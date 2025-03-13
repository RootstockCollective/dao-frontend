import { Link } from '@/components/Link'
import { splitCombinedName } from '../../shared/utils'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => {
  const { proposalName } = splitCombinedName(name)
  return <Link href={`/proposals/${proposalId}`}>{proposalName.slice(0, 50)}</Link>
}
