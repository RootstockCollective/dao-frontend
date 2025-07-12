'use client'

import { useSearchParams } from 'next/navigation'
import { GrantsProposalForm } from './proposal-forms/GrantsProposalForm'
import { ActivationProposalForm } from './proposal-forms/ActivationProposalForm'
import { DeactivationProposalForm } from './proposal-forms/DeactivationProposalForm'

// Map of contract/action pairs to their respective form components
const PROPOSAL_FORMS = {
  'DAOTreasuryAbi.withdraw': GrantsProposalForm,
  'DAOTreasuryAbi.withdrawERC20': GrantsProposalForm,
  'BuilderRegistryAbi.communityApproveBuilder': ActivationProposalForm,
  'BuilderRegistryAbi.dewhitelistBuilder': DeactivationProposalForm,
} as const satisfies Record<string, React.ElementType>

export default function CreateProposal() {
  const searchParams = useSearchParams()
  const contract = searchParams?.get('contract')
  const action = searchParams?.get('action')

  // Find the appropriate form component or default to GrantsProposalForm
  const key = `${contract}.${action}` as keyof typeof PROPOSAL_FORMS
  const ProposalForm = PROPOSAL_FORMS[key] || GrantsProposalForm
  return <ProposalForm />
}
