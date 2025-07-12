import { GrantProposal } from '../create/proposal-forms/GrantsProposalForm'
import { BuilderProposal } from '../create/proposal-forms/ActivationProposalForm'
import { DeactivationProposal } from '../create/proposal-forms/DeactivationProposalForm'

export type Proposals = GrantProposal | BuilderProposal | DeactivationProposal | null
