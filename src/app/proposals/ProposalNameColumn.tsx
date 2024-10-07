import { useRouter } from 'next/navigation'
import { useProposalContext } from '@/app/proposals/ProposalsContext'
import { Span } from '@/components/Typography'

export const ProposalNameColumn = () => {
  const router = useRouter()
  const { name, proposalId } = useProposalContext()
  return (
    <button onClick={() => router.push(`/proposals/${proposalId}`)}>
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-white">
        {name.slice(0, 20)}
      </Span>
    </button>
  )
}
