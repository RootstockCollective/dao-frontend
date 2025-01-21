import { StaticImageData } from 'next/image'
import standardImage from './images/standard.png'
import StandardInfoPanel from './info-panel/Standard'
import activationImage from './images/activation.png'
import ActivationInfoPanel from './info-panel/Activation'
import deactivationImage from './images/deactivation.png'
import DeactivationInfoPanel from './info-panel/Deactivation'
import { SupportedActionAbiName, SupportedProposalActionName } from '../shared/supportedABIs'
import { ReactElement } from 'react'

export type ProposalType = 'Standard' | 'Activation' | 'Deactivation'

export interface Card {
  id: number
  title: string
  image: StaticImageData
  description: string
  contract: SupportedActionAbiName
  action: SupportedProposalActionName
  proposalType: ProposalType
  infoPanel: ReactElement
}

export const cards: Card[] = [
  {
    id: 1,
    title: 'Standard',
    description:
      'Request community votes to allocate RootstockCollective treasury funds for grants, growth initiatives, or governance goals.',
    image: standardImage,
    contract: 'DAOTreasuryAbi',
    action: 'withdraw',
    proposalType: 'Standard',
    infoPanel: <StandardInfoPanel />,
  },
  {
    id: 2,
    title: 'Builder Activation',
    description:
      'Request community votes to add a Builder to the RootstockCollective whitelist, granting them rewards access.',
    image: activationImage,
    contract: 'BuilderRegistryAbi',
    action: 'communityApproveBuilder',
    proposalType: 'Activation',
    infoPanel: <ActivationInfoPanel />,
  },
  {
    id: 3,
    title: 'Builder Deactivation',
    description:
      'Request community votes to remove a Builder from the RootstockCollective whitelist, revoking their rewards access.',
    image: deactivationImage,
    contract: 'BuilderRegistryAbi',
    action: 'dewhitelistBuilder',
    proposalType: 'Deactivation',
    infoPanel: <DeactivationInfoPanel />,
  },
]
