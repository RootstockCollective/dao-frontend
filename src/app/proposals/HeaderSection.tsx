import { useRouter } from 'next/navigation'
import { Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { FaPlus } from 'react-icons/fa6'

export const HeaderSection = ({ createProposalDisabled = true }) => {
  const router = useRouter()

  return (
    <div className="flex flex-row justify-between container pl-4">
      <Paragraph className="font-semibold text-[18px]">My Governance</Paragraph>
      <div className="flex flex-row gap-x-6">
        <Button
          startIcon={<FaPlus />}
          onClick={() => router.push('/proposals/create')}
          disabled={createProposalDisabled}
        >
          Create Proposal
        </Button>
        {/*<Button variant="secondary" disabled>*/}
        {/*  Delegate*/}
        {/*</Button>*/}
      </div>
    </div>
  )
}
