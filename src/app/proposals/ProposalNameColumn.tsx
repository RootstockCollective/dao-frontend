import { useRouter } from 'next/navigation'
import { Span } from '@/components/Typography'
import { splitCombinedName } from './shared/utils'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => {
  const router = useRouter()

  const { proposalName } = splitCombinedName(name)
  return (
    <button
      onClick={() => {
        router.push(`/proposals/${proposalId}`)
      }}
    >
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-white">
        {proposalName.slice(0, 50)}
      </Span>
    </button>
  )
}
