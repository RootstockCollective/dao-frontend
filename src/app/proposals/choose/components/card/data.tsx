import { StaticImageData } from 'next/image'
import standardImage from './images/standard.png'
import activationImage from './images/activation.png'
import deactivationImage from './images/deactivation.png'
import { SupportedActionAbiName, SupportedProposalActionName } from '../../../shared/supportedABIs'
import type { ProposalType } from '../../types'

interface Card {
  id: number
  title: string
  image: StaticImageData
  description: string
  contract: SupportedActionAbiName
  action: SupportedProposalActionName
}

export const cardData: Record<ProposalType, Card> = {
  Standard: {
    id: 1,
    title: 'Standard',
    description:
      'Request community votes to allocate RootstockCollective treasury funds for grants, growth initiatives, or governance goals.',
    image: standardImage,
    contract: 'DAOTreasuryAbi',
    action: 'withdraw',
  },
  Activation: {
    id: 2,
    title: 'Builder Activation',
    description:
      'Request community votes to add a Builder to the RootstockCollective whitelist, granting them rewards access.',
    image: activationImage,
    contract: 'BuilderRegistryAbi',
    action: 'communityApproveBuilder',
  },
  Deactivation: {
    id: 3,
    title: 'Builder Deactivation',
    description:
      'Request community votes to remove a Builder from the RootstockCollective whitelist, revoking their rewards access.',
    image: deactivationImage,
    contract: 'BuilderRegistryAbi',
    action: 'dewhitelistBuilder',
  },
}
