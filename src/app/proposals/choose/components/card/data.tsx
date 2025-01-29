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
    title: 'Get a Grant',
    description: 'Community vote to allocate treasury funds for Grants',
    image: standardImage,
    contract: 'DAOTreasuryAbi',
    action: 'withdraw',
  },
  Activation: {
    id: 2,
    title: 'Builder Activation',
    description: 'Community vote to add a Builder to the whitelist, granting access to rewards',
    image: activationImage,
    contract: 'BuilderRegistryAbi',
    action: 'communityApproveBuilder',
  },
  Deactivation: {
    id: 3,
    title: 'Builder Deactivation',
    description: 'Community vote to remove a Builder from the whitelist, removing access to rewards',
    image: deactivationImage,
    contract: 'BuilderRegistryAbi',
    action: 'dewhitelistBuilder',
  },
}
