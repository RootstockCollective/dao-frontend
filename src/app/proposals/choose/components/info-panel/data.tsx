import type { FC, HTMLAttributes } from 'react'
import type { ProposalType } from '../../types'
import ChatIcon from './icons/chat-icon'
import DocIcon from './icons/doc-icon'
import KycIcon from './icons/kyc-icon'
import { DeactivationFooter } from './deactivation-footer'

interface MustHave {
  title: string
  requirements: {
    id: number
    Text: FC<HTMLAttributes<HTMLSpanElement>>
    LinkText: FC<HTMLAttributes<HTMLSpanElement>>
    linkUrl: string
    Icon: typeof ChatIcon
  }[]
  Footer?: FC<HTMLAttributes<HTMLElement>>
}

export const infoPanelData: Record<ProposalType, MustHave> = {
  Standard: {
    title: 'Get a Grant Must Have',
    requirements: [
      {
        id: 1,
        Text: props => (
          <span {...props}>
            Ensure your project aligns with the <strong>Grant themes</strong> and goals of the Rootstock
            Ecosystem and draft your proposal
          </span>
        ),
        LinkText: props => (
          <span {...props} data-testid="EcosystemGoalsLink">
            Learn about the ecosystem goals <strong>for Grants</strong>
          </span>
        ),
        linkUrl: 'https://rootstockcollective.xyz/submitting-a-grant-proposal/',
        Icon: DocIcon,
      },
      {
        id: 2,
        Text: props => (
          <span {...props}>
            A <strong>Grant post</strong> should be created off-chain on Discourse. If you haven’t done this
            yet, don’t worry its pretty easy and you can browse other posts and ask the community for tips 😉
          </span>
        ),
        LinkText: props => (
          <span {...props} data-testid="DiscourseLink">
            Go to Governance Forum on Discourse
          </span>
        ),
        linkUrl: 'https://gov.rootstockcollective.xyz/c/grants/5',
        Icon: ChatIcon,
      },
      {
        id: 3,
        Text: props => (
          <span {...props}>
            KYC <strong>for your Grant</strong> - required if your proposal passes the community vote. Its
            best to get this started while your submission is being discussed and voted on, so there are no
            delays 😀
          </span>
        ),
        LinkText: props => (
          <span {...props} data-testid="KycLink">
            Get started on KYC here
          </span>
        ),
        linkUrl:
          'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
        Icon: KycIcon,
      },
    ],
  },
  Activation: {
    title: 'Join Builder Rewards Must Have',
    requirements: [
      {
        id: 1,
        Text: props => (
          <span {...props}>
            Ensure your project aligns with the <strong>Collective Rewards</strong> goals of the Rootstock
            Ecosystem and draft your proposal
          </span>
        ),
        LinkText: props => (
          <span {...props} data-testid="EcosystemGoalsLink">
            Learn about the ecosystem goals for <strong>Builder Activations</strong>
          </span>
        ),
        linkUrl: 'https://rootstockcollective.xyz/collective-rewards-become-a-builder/',
        Icon: DocIcon,
      },
      {
        id: 2,
        Text: props => (
          <span {...props}>
            A <strong>Builder Activation post</strong> should be created off-chain on Discourse. If you
            haven’t done this yet, don’t worry its pretty easy and you can browse other posts and ask the
            community for tips 😉
          </span>
        ),
        LinkText: props => (
          <span {...props} data-testid="DiscourseLink">
            Go to Governance Forum on Discourse
          </span>
        ),
        linkUrl: 'https://gov.rootstockcollective.xyz/c/collective-rewards/7',
        Icon: ChatIcon,
      },
      {
        id: 3,
        Text: props => (
          <span {...props}>
            <strong>Builder Activation KYC</strong> - required if your proposal passes the community vote. Its
            best to get this started while your submission is being discussed and voted on, so there are no
            delays 😀
          </span>
        ),
        LinkText: props => (
          <span {...props} data-testid="KycLink">
            Get started on KYC here
          </span>
        ),
        linkUrl:
          'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
        Icon: KycIcon,
      },
    ],
    Footer: DeactivationFooter,
  },
}
