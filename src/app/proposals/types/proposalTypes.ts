import { type GrantProposal } from '../new/details/schemas/GrantProposalSchema'
import { type ActivationProposal } from '../new/details/schemas/ActivationProposalSchema'
import { type DeactivationProposal } from '../new/details/schemas/DeactivationProposalSchema'

export enum ProposalType {
  Grant = 'grant',
  Activation = 'activation',
  Deactivation = 'deactivation',
}

export type ProposalRecord =
  | { type: ProposalType.Grant; form: GrantProposal }
  | { type: ProposalType.Activation; form: ActivationProposal }
  | { type: ProposalType.Deactivation; form: DeactivationProposal }
