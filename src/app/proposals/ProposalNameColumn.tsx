import { useRouter } from 'next/navigation'
import { useProposalContext } from '@/app/proposals/ProposalsContext'

export const ProposalNameColumn = () => {
  const router = useRouter()
  const { name, proposalId } = useProposalContext()
  return (
    <button onClick={() => router.push(`/proposals/${proposalId}`)}>
      <span className="underline text-left">{name.slice(0, 20)}</span>
    </button>
  )
}
