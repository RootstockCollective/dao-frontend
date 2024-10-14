import { useRouter } from 'next/navigation'
import { Paragraph, HeaderTitle } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { SupportedActionAbiName, SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'

export const HeaderSection = ({ createProposalDisabled = true, threshold = '' }) => (
  <div className="flex flex-row justify-between container">
    <HeaderTitle>My Governance</HeaderTitle>
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
      onClick={() => router.push(`/proposals/create?contract=${contract}&action=${action}`)}
      disabled={disabled}
      data-testid="CreateProposal"
    >
      Create Proposal
    </Button>
  )
}
