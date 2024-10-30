import { useRouter } from 'next/navigation'
import { useProposalContext } from '@/app/proposals/ProposalsContext'
import { Span } from '@/components/Typography'
import { splitCombinedName } from './shared/utils'

export const ProposalNameColumn = () => {
  const router = useRouter()
  const { name, proposalId } = useProposalContext()

  const { proposalName } = splitCombinedName(name)
  return (
    <button onClick={() => router.push(`/proposals/${proposalId}`)}>
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-white">
        {proposalName.slice(0, 50)}
      </Span>
    </button>
  )
}
