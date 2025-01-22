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

export interface MustHave {
  text: string
  linkText: string
  linkUrl: string
  icon: ReactElement
}

export interface Card {
  id: number
  title: string
  image: StaticImageData
  description: string
  contract: SupportedActionAbiName
  action: SupportedProposalActionName
  proposalType: ProposalType
  mustHave: MustHave[]
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
    mustHave: [
      {
        text: 'Ensure your project aligns with the goals of the Rootstock Ecosystem and draft your proposal',
        linkText: 'Learn about the ecosystem goals and steps on how to submit a proposal ',
        linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
        icon: <></>,
      },
      {
        text: 'A post on the off-chain Governance Forum, on Discourse, should have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉',
        linkText: 'Go to Governance Forum on Discourse',
        linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
        icon: <></>,
      },
      {
        text: 'Get started on KYC - all applicants must pass KYC checks conducted by the Rootstock Collective Foundation after a successful vote by the community. If the vote does not pass, KYC is not required however its best to get familiar with this now and get started on this while your submission is being discussed and voted on, so there are no delays 🙂',
        linkText: 'Get started on KYC here',
        linkUrl:
          'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
        icon: <></>,
      },
    ],
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
    mustHave: [
      {
        text: 'Ensure your project aligns with the goals of the Rootstock Ecosystem and draft your proposal',
        linkText: 'Learn about the ecosystem goals and steps on how to submit a proposal',
        linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
        icon: <></>,
      },
      {
        text: 'A post on the off-chain Governance Forum, on Discourse, should have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉',
        linkText: 'Go to Governance Forum on Discourse',
        linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
        icon: <></>,
      },
      {
        text: 'Get started on KYC - all applicants must pass KYC checks conducted by the Rootstock Collective Foundation after a successful vote by the community. If the vote does not pass, KYC is not required however its best to get familiar with this now and get started on this while your submission is being discussed and voted on, so there are no delays 🙂',
        linkText: 'Get started on KYC here',
        linkUrl:
          'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
        icon: <></>,
      },
    ],
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
    mustHave: [
      {
        text: 'Clearly explain why the project no longer aligns with the goals of the Rootstock Ecosystem and draft your proposal',
        linkText: 'Learn about the ecosystem goals and steps on how to submit a proposal ',
        linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
        icon: <></>,
      },
      {
        text: 'A post on the off-chain Governance Forum, on Discourse, should have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉',
        linkText: 'Go to Governance Forum on Discourse',
        linkUrl: 'https://gov.rootstockcollective.xyz/c/collective-rewards/7',
        icon: <></>,
      },
    ],
  },
]
