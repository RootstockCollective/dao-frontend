import { type GrantProposal } from '../new/create/schemas/GrantProposalSchema'
import { type ActivationProposal } from '../new/create/schemas/ActivationProposalSchema'
import { type DeactivationProposal } from '../new/create/schemas/DeactivationProposalSchema';

export enum ProposalType {
  Grant = 'grant',
  Activation = 'activation',
  Deactivation = 'deactivation',
}

export type ProposalRecord =
  | { type: ProposalType.Grant; form: GrantProposal }
  | { type: ProposalType.Activation; form: ActivationProposal }
  | { type: ProposalType.Deactivation; form: DeactivationProposal }
