import { useRouter } from 'next/navigation'
import { Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { FaPlus } from 'react-icons/fa6'
import { Popover } from '@/components/Popover'

export const HeaderSection = ({ createProposalDisabled = true, threshold = '' }) => {
  const router = useRouter()

  return (
    <div className="flex flex-row justify-between container pl-4">
      <Paragraph className="font-semibold text-[18px]">My Governance</Paragraph>
      <div className="flex flex-row gap-x-6">
        <Popover
          content={
            <Paragraph variant="normal" className="text-sm">
              You don&apos;t have enough voting power: {threshold}
            </Paragraph>
          }
          trigger="hover"
          background="dark"
          size="small"
        >
          <Button
            startIcon={<FaPlus />}
            onClick={() => router.push('/proposals/create')}
            disabled={createProposalDisabled}
          >
            Create Proposal
          </Button>
        </Popover>
        {/*<Button variant="secondary" disabled>*/}
        {/*  Delegate*/}
        {/*</Button>*/}
      </div>
    </div>
  )
}
