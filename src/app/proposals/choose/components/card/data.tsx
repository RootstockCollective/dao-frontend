import { StaticImageData } from 'next/image'
import standardImage from './images/standard.png'
import activationImage from './images/activation.png'
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
    title: 'JOIN BUILDER REWARDS',
    description: 'Community vote to add a Builder, granting access to Rewards',
    image: activationImage,
    contract: 'BuilderRegistryAbi',
    action: 'communityApproveBuilder',
  },
}
