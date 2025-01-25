import { ReactElement } from 'react'
import type { ProposalType } from '../../types'
import ChatIcon from './icons/chat-icon'
import DocIcon from './icons/doc-icon'
import KycIcon from './icons/kyc-icon'

interface MustHave {
  id: number
  text: ReactElement
  linkText: ReactElement
  linkUrl: string
  icon: ReactElement
}

export const infoPanelData: Record<ProposalType, MustHave[]> = {
  Standard: [
    {
      id: 1,
      text: (
        <span>
          Ensure your project aligns with the <strong>Grant themes</strong> and goals of the Rootstock
          Ecosystem and draft your proposal
        </span>
      ),
      linkText: (
        <span>
          Learn about the ecosystem goals and steps on how to submit a <strong>Grant</strong> proposal
        </span>
      ),
      linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
      icon: <DocIcon />,
    },
    {
      id: 2,
      text: (
        <span>
          A post <strong>about the Grant</strong> on the off-chain Governance Forum, on Discourse, should have
          previously been created. If you havn’t done this yet, don’t worry its pretty easy and you can browse
          other posts and ask the community for tips 😉
        </span>
      ),
      linkText: <span>Go to Governance Forum on Discourse</span>,
      linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
      icon: <ChatIcon />,
    },
    {
      id: 3,
      text: (
        <span>
          Get started on KYC <strong>for your Grant</strong>- all applicants must pass KYC checks conducted by
          the Rootstock Collective Foundation after a successful vote by the community. If the vote does not
          pass, KYC is not required however its best to get familiar with this now and get started on this
          while your submission is being discussed and voted on, so there are no delays 🙂
        </span>
      ),
      linkText: <span>Get started on KYC here</span>,
      linkUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      icon: <KycIcon />,
    },
  ],
  Activation: [
    {
      id: 1,
      text: (
        <span>
          Ensure your project aligns with the <strong>Collective Rewards</strong> goals of the Rootstock
          Ecosystem and draft your proposal
        </span>
      ),
      linkText: (
        <span>
          Learn about the ecosystem goals and steps on how to submit a <strong>Builder Activation</strong>{' '}
          proposal
        </span>
      ),
      linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
      icon: <DocIcon />,
    },
    {
      id: 2,
      text: (
        <span>
          A <strong>Builder Activation</strong> post on the off-chain Governance Forum, on Discourse, should
          have previously been created. If you haven’t done this yet, don’t worry its pretty easy and you can
          browse other posts and ask the community for tips 😉
        </span>
      ),
      linkText: <span>Go to Governance Forum on Discourse</span>,
      linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
      icon: <ChatIcon />,
    },
    {
      id: 3,
      text: (
        <span>
          Get started on <strong>Builder Activation</strong> KYC - all applicants must pass KYC checks
          conducted by the Rootstock Collective Foundation after a successful vote by the community. If the
          vote does not pass, KYC is not required however its best to get familiar with this now and get
          started on this while your submission is being discussed and voted on, so there are no delays 🙂
        </span>
      ),
      linkText: <span>Get started on KYC here</span>,
      linkUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      icon: <KycIcon />,
    },
  ],
  Deactivation: [
    {
      id: 1,
      text: (
        <span>
          We are sad to see you go. Clearly explain why the project no longer aligns with the goals of the
          Collective Rewards in a proposal
        </span>
      ),
      linkText: <span>Learn more on how to submit a draft proposal</span>,
      linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
      icon: <DocIcon />,
    },
    {
      id: 2,
      text: <span>Make sure you have already made an off-chain Governance Forum post on Discourse</span>,
      linkText: <span>Go to Governance Forum on Discourse</span>,
      linkUrl: 'https://gov.rootstockcollective.xyz/c/collective-rewards/7',
      icon: <ChatIcon />,
    },
  ],
}
