import { Link } from '@/components/Link'
import { splitCombinedName } from '../../shared/utils'
import { ArrowUpRightIcon } from '@/components/Icons'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => {
  const { proposalName } = splitCombinedName(name)
  const proposalToDisplay = proposalName.length > 50 ? `${proposalName.slice(0, 50)}...` : proposalName
  return (
    <Link href={`/proposals/${proposalId}`}>
      {proposalToDisplay}
      <ArrowUpRightIcon size={18} />
    </Link>
  )
}
