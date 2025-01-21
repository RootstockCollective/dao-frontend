import { StaticImageData } from 'next/image'
import standard from './images/standard.png'
import activation from './images/activation.png'
import deactivation from './images/deactivation.png'
import { SupportedActionAbiName, SupportedProposalActionName } from '../shared/supportedABIs'

export type ProposalType = 'Standard' | 'Activation' | 'Deactivation'

export interface Card {
  id: number
  title: string
  image: StaticImageData
  description: string
  contract: SupportedActionAbiName
  action: SupportedProposalActionName
  proposalType: ProposalType
}

export const cards: Card[] = [
  {
    id: 1,
    title: 'Standard',
    description:
      'Request community votes to allocate RootstockCollective treasury funds for grants, growth initiatives, or governance goals.',
    image: standard,
    contract: 'DAOTreasuryAbi',
    action: 'withdraw',
    proposalType: 'Standard',
  },
  {
    id: 2,
    title: 'Builder Activation',
    description:
      'Request community votes to add a Builder to the RootstockCollective whitelist, granting them rewards access.',
    image: activation,
    contract: 'BuilderRegistryAbi',
    action: 'communityApproveBuilder',
    proposalType: 'Activation',
  },
  {
    id: 3,
    title: 'Builder Deactivation',
    description:
      'Request community votes to remove a Builder from the RootstockCollective whitelist, revoking their rewards access.',
    image: deactivation,
    contract: 'BuilderRegistryAbi',
    action: 'dewhitelistBuilder',
    proposalType: 'Deactivation',
  },
]
