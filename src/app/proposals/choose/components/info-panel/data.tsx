import { ReactElement } from 'react'
import type { ProposalType } from '../../types'
import ChatIcon from './icons/chat-icon'
import DocIcon from './icons/doc-icon'
import KycIcon from './icons/kyc-icon'

export interface MustHave {
  id: number
  text: string
  linkText: string
  linkUrl: string
  icon: ReactElement
}

export const infoPanelData: Record<ProposalType, MustHave[]> = {
  Standard: [
    {
      id: 1,
      text: 'Ensure your project aligns with the goals of the Rootstock Ecosystem and draft your proposal',
      linkText: 'Learn about the ecosystem goals and steps on how to submit a proposal ',
      linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
      icon: <DocIcon />,
    },
    {
      id: 2,
      text: 'A post on the off-chain Governance Forum, on Discourse, should have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉',
      linkText: 'Go to Governance Forum on Discourse',
      linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
      icon: <ChatIcon />,
    },
    {
      id: 3,
      text: 'Get started on KYC - all applicants must pass KYC checks conducted by the Rootstock Collective Foundation after a successful vote by the community. If the vote does not pass, KYC is not required however its best to get familiar with this now and get started on this while your submission is being discussed and voted on, so there are no delays 🙂',
      linkText: 'Get started on KYC here',
      linkUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      icon: <KycIcon />,
    },
  ],
  Activation: [
    {
      id: 1,
      text: 'Ensure your project aligns with the goals of the Rootstock Ecosystem and draft your proposal',
      linkText: 'Learn about the ecosystem goals and steps on how to submit a proposal',
      linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
      icon: <DocIcon />,
    },
    {
      id: 2,
      text: 'A post on the off-chain Governance Forum, on Discourse, should have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉',
      linkText: 'Go to Governance Forum on Discourse',
      linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
      icon: <ChatIcon />,
    },
    {
      id: 3,
      text: 'Get started on KYC - all applicants must pass KYC checks conducted by the Rootstock Collective Foundation after a successful vote by the community. If the vote does not pass, KYC is not required however its best to get familiar with this now and get started on this while your submission is being discussed and voted on, so there are no delays 🙂',
      linkText: 'Get started on KYC here',
      linkUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      icon: <KycIcon />,
    },
  ],
  Deactivation: [
    {
      id: 1,
      text: 'Clearly explain why the project no longer aligns with the goals of the Rootstock Ecosystem and draft your proposal',
      linkText: 'Learn about the ecosystem goals and steps on how to submit a proposal ',
      linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
      icon: <DocIcon />,
    },
    {
      id: 2,
      text: 'A post on the off-chain Governance Forum, on Discourse, should have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉',
      linkText: 'Go to Governance Forum on Discourse',
      linkUrl: 'https://gov.rootstockcollective.xyz/c/collective-rewards/7',
      icon: <ChatIcon />,
    },
  ],
}
