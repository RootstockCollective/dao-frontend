import { useRouter } from 'next/navigation'
import { Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { FaPlus } from 'react-icons/fa6'
import { Popover } from '@/components/Popover'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'

export const HeaderSection = ({ createProposalDisabled = true, threshold = '' }) => (
  <div className="flex flex-row justify-between container">
    <Paragraph className="font-semibold text-[18px]">My Governance</Paragraph>
    <div className="flex flex-row gap-x-6">
      {createProposalDisabled ? (
        <Popover
          content={
            <Paragraph variant="normal" className="text-sm">
              Almost there! You need {threshold} stRIF to create a proposal. Stake more RIF to get started.
            </Paragraph>
          }
          trigger="hover"
          background="dark"
          size="small"
        >
          <CreateProposalButton disabled />
        </Popover>
      ) : (
        <CreateProposalButton />
      )}
      {/*<Button variant="secondary" disabled>*/}
      {/*  Delegate*/}
      {/*</Button>*/}
    </div>
  </div>
)

const CreateProposalButton = ({ disabled = false }) => {
  const router = useRouter()
  const contract: SupportedActionAbiName = 'DAOTreasuryAbi'
  const action: SupportedProposalActionName = 'withdraw'

  return (
    <Button
      startIcon={<FaPlus />}
      onClick={() => router.push(`/proposals/create?contract=${contract}&action=${action}`)}
      disabled={disabled}
    >
      Create Proposal
    </Button>
  )
}
