import Link from 'next/link'
import { splitCombinedName } from '../../shared/utils'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => {
  const { proposalName } = splitCombinedName(name)
  return (
    <Link
      className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
      href={`/proposals/${proposalId}`}
    >
      {proposalName}
    </Link>
  )
}
